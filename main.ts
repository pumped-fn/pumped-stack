import { createScope, resource, resolve } from "@pumped-fn/core";
import { serve } from "bun";
import { handlers } from "./be";
import { validateInput } from "./extra";
import { bunContext, toBunHandlers } from "./extra/bun";
import App from "./fe/index.html";
import { actions } from "./rpc";

const scope = createScope();

const startServer = resource(
	[toBunHandlers(handlers)],
	async ([bunHandlers]) => {
		const server = serve({
			port: 3000,
			development: process.env.NODE_ENV !== "prod",
			routes: {
				"/*": App,
				...bunHandlers,
				"/rpc": {
					POST: async (req) => {
						const context = bunContext({
							request: req,
							bunRequest: req,
						});

						const handlersContainer = await resolve(scope, handlers);

						const resolvedHandlers = handlersContainer.get().implementations;

						const subject = req.headers.get("subject") as
							| keyof typeof resolvedHandlers
							| undefined;
						if (!subject || !resolvedHandlers[subject]) {
							return new Response("Invalid subject", { status: 400 });
						}

						const handler = resolvedHandlers[subject].handler;
						const validator = actions[subject].input;

						let param: unknown = undefined;
						if (!req.body || req.body.length === 0) {
							param = await validateInput(validator, undefined);
						} else {
							param = await req.json();
							param = await validateInput(validator, param as never);
						}

						const response = await handler(param as never, context);
						return response
							? Response.json(response)
							: new Response(null, { status: 204 });
					},
				},
			},
			error: (error) => {
				return new Response(error.message, { status: 500 });
			},
		});

		return [
			server,
			async () => {
				console.log("shutting down server");
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
