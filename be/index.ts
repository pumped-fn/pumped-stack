import { provide } from "@pumped-fn/core";
import { http } from "@pumped-fn/extra/meta/http";
import { implement, route } from "@pumped-fn/extra/server";
import { getConnection } from "../drizzle/drizzle";
import { identity } from "../drizzle/schema";
import { actions } from "../rpc";

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
	provide(getConnection, async (getConnection) => async ({ data }) => {
		const db = await getConnection();

		await db.insert(identity).values(data);
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
