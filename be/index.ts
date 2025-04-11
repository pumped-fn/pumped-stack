import { provide, any } from "@pumped-fn/core";
import { impl } from "@pumped-fn/extra";
import { getConnection } from "./drizzle";
import { identity } from "../drizzle/schema";
import { actions } from "../rpc";
import { httpMeta } from "../extra/http"
import type { BunRequest } from "bun";

const bunRequest = any<BunRequest<string>>()

const get = impl.api(
  actions,
  "get.users",
  bunRequest,
  provide(getConnection, async (db) => async () => {
    return db.select().from(identity);
  }),
);

const create = impl.api(
  actions,
  "create.user",
  bunRequest,
  provide(getConnection, async (db) => async (_, data) => {
    await db.insert(identity).values(data);
  }),
  httpMeta({ method: 'POST' })
);

const hello = impl.api(
  actions,
  "hello",
  bunRequest,
  provide(() => () => "hello")
);

export const routes = [get, create, hello];