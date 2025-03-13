import type { StandardSchemaV1 } from "./standardschema";

export interface API<I, O> extends Record<string | symbol, unknown> {
	readonly input: StandardSchemaV1<I>;
	readonly output: StandardSchemaV1<O>;
}

export type AnyAPI = API<unknown, unknown>;

export function api<I = undefined, O = void>(api: API<I, O>): typeof api {
	return api;
}

export interface Service extends Record<string, AnyAPI> {}

export function service<Service extends Record<string, AnyAPI>>(
	service: Service,
) {
	return service;
}
