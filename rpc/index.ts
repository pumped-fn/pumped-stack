import { define } from "@pumped-fn/extra";
import { z } from "zod";
import type { Identity } from "../drizzle/types";

export const actions = define.service({
  hello: define.api({
    input: z.undefined(),
    output: z.string(),
  }),
  "get.users": define.api({
    input: z.undefined(),
    output: z.custom<Identity[]>(),
  }),
  "create.user": define.api({
    input: z.object({ username: z.string() }),
    output: z.void(),
  }),
});
