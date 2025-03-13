import { provide } from "@pumped-fn/core";
import { actions } from "../rpc";
import { implement, route } from "../extra/server";
import { http } from "../extra/meta/http";
import { getConnection } from "../drizzle/drizzle";
import { identity } from "../drizzle/schema";

const get = implement(
	actions,
	"get.users",
	provide(getConnection, async (getConnection) => async () => {
		const db = await getConnection();
		return db.select().from(identity);
	}),
);

const create = implement(
	actions,
	"create.user",
	[http.method("POST")],
	provide(getConnection, async (getConnection) => async (param) => {
		const db = await getConnection();

		await db.insert(identity).values(param);
	}),
);

export const handlers = route(
	actions,
	{
		hello: implement(
			actions,
			"hello",
			provide(() => () => "hello"),
		),
		"get.users": get,
		"create.user": create,
	},
	http.prefix("/rpc"),
);
