import { createScope, resource, resolve, resolveOnce } from "@pumped-fn/core";
import { serve } from "bun";
import { handlers } from "./be";
import { bunRequestHandler, toBunHandlers } from "./extra/bun";
import App from "./fe/index.html";
import { createBunContext } from "./extra/bun";
import { createRouteCaller } from "./extra/server";

const scope = createScope();
const startServer = resource(
	[toBunHandlers(handlers)],
	async ([bunHandlers]) => {
		const server = serve({
			port: 3000,
			development: process.env.NODE_ENV !== "prod",
			routes: {
				"/*": App,
				"/rpc": {
					POST: async (req) => {
						const resolvedHandlers = await resolveOnce(scope, handlers);

						const subject = req.headers.get("subject");

						if (!subject) {
							return new Response("Missing subject", { status: 400 });
						}

						if (!resolvedHandlers.implementations[subject]) {
							return new Response("Invalid subject", { status: 400 });
						}

						const routeCaller = createRouteCaller(
							resolvedHandlers,
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							subject as any,
							bunRequestHandler,
						);

						const routeContext = createBunContext(req);

						const response = await routeCaller(routeContext);
						return response
							? Response.json(response)
							: new Response(null, { status: 204 });
					},
				},
			},
			error: (error) => {
				console.error(error);
				return new Response(error.message, { status: 500 });
			},
		});

		return [
			server,
			async () => {
				await server.stop();
				server.unref();
			},
		];
	},
);

await resolve(scope, startServer);

process.on("SIGINT", async () => {
	await scope.dispose();
});

process.on("unhandledRejection", async (reason) => {
	console.error("Unhandled rejection:", reason);
	await scope.dispose();
});
