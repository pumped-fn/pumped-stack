import { api, service } from "@pumped-fn/extra";
import { z } from "zod";
import type { Identity } from "../drizzle/types";

export const actions = service({
	hello: api({
		input: z.undefined(),
		output: z.string(),
	}),
	"get.users": api({
		input: z.undefined(),
		output: z.custom<Identity[]>(),
	}),
	"create.user": api({
		input: z.object({ username: z.string() }),
		output: z.void(),
	}),
});
