import { actions } from "../rpc";
import {
	buildClient,
	clientProvider,
	defineRequestBuilder,
} from "@pumped-fn/extra/client";

import { up } from "up-fetch";
import { validateInput } from "@pumped-fn/extra";

const fetcher = up(fetch, () => ({
	baseUrl: "/rpc",
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
}));

const upfetchRequestBuilder = defineRequestBuilder(
	async (path, def, params) => {
		const validatedParam = await validateInput(def.input, params);
		console.log("request", path, def, params, validatedParam);
		const response = await fetcher("", {
			body: validatedParam ?? undefined,
			headers: {
				subject: path,
			},
		});

		if (!response) {
			return;
		}

		const validatedResponse = await validateInput(def.output, response);
		return validatedResponse;
	},
);

export const client = buildClient(actions, upfetchRequestBuilder);
export const directClient = clientProvider(actions, upfetchRequestBuilder);
