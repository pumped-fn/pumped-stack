import { executionValue, provide, reactive } from "@pumped-fn/core";
import type { BunRequest } from "bun";
import { z } from "zod";

export const requestId = executionValue("requestId", z.string());

export const bunRequest = executionValue("bunRequest", z.custom<BunRequest<string>>())

export const logger = (name: string) => reactive(
  requestId.finder,
  (requestId) => {
    return (...messages: unknown[]) => {
      if (requestId.get()) {
        console.log(`[${requestId.get()}.${name}]`, ...messages);
      } else {
        console.log(`[${name}]`, ...messages);
      }
    }
  })
