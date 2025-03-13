import { api, service } from "../extra";
import { z } from "zod";
import type { Identity } from "../drizzle/types";

console.log("rpc");

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

export const testHttp = service({
	ping: api({
		input: z.undefined(),
		output: z.string(),
	}),
});
