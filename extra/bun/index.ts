import { provide, type Executor } from "@pumped-fn/core";
import type { BunRequest } from "bun";
import type { Context } from "../meta";
import { getMethod, getPrefix } from "../meta/http";
import type { Route } from "../server";
import { validateInput } from "../standardschema";

export const contextSymbol = Symbol.for("@pumped-fn.context.bun");

export interface BunContext extends Context {
	[contextSymbol]: {
		request: Request;
		bunRequest: BunRequest;
	};
}

export const isBunContext = (ctx: unknown): ctx is BunContext => {
	return typeof ctx === "object" && ctx !== null && contextSymbol in ctx;
};

export const bunContext = (bunContext: BunContext[typeof contextSymbol]) => {
	return {
		[contextSymbol]: bunContext,
	};
};

type Method = "GET" | "POST" | "PUT" | "DELETE";

type BunRoute = Record<
	Method,
	(req: BunRequest) => Response | Promise<Response>
>;
type BunHandler = Record<string, BunRoute>;

export const toBunHandlers = (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	...routes: Executor<Route<any>>[]
): Executor<BunHandler> => {
	return provide(routes, async (routes) => {
		const handlers: BunHandler = {};
		for (const { meta: routeMeta, implementations } of routes) {
			const defaultRouteMethod = (await getMethod(routeMeta)) ?? "GET";
			const defaultPrefix = (await getPrefix(routeMeta)) ?? "";

			for (const key in implementations) {
				const { meta: handlerMeta, handler, definition } = implementations[key];
				const routeMethod =
					(await getMethod(handlerMeta)) ?? defaultRouteMethod;
				const prefix = (await getPrefix(handlerMeta)) ?? defaultPrefix;

				const path = `${prefix}/${key}`;
				const bunRoute = handlers[path] ?? ({} as BunRoute);
				handlers[path] = bunRoute;

				bunRoute[routeMethod] = async (req: BunRequest) => {
					let body: unknown = undefined;

					if (req.body !== null && req.body.length > 0) {
						body = req.json();
					}

					const param = await validateInput(definition.input, body);

					const context = bunContext({
						request: req,
						bunRequest: req,
					});

					const result = await handler(param, context);

					if (result) {
						const response = new Response(JSON.stringify(result), {
							headers: {
								"Content-Type": "application/json",
							},
						});

						return response;
					}

					return new Response(null, { status: 204 });
				};
			}
		}
		return handlers;
	});
};
