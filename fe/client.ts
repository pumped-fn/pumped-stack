import { actions } from "../rpc";
import {
  client
} from "@pumped-fn/extra";

import { up } from "up-fetch";
import { validateInput } from "@pumped-fn/core";

const fetcher = up(fetch, () => ({
  baseUrl: "/rpc",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
}));

const upfetchRequestBuilder = client.createAnyRequestHandler(
  async (defs, path, params) => {
    const def = defs[path];

    if (!def) {
      throw new Error(`Unknown path: ${path}`);
    }

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

export const caller = client.createCaller(actions, upfetchRequestBuilder);