import { provide, derive } from "@pumped-fn/core-next";
import { impl } from "@pumped-fn/extra";
import { getConnection } from "./drizzle";
import { identity } from "../drizzle/schema";
import { actions } from "../rpc";
import { httpMeta } from "../extra/http"
import { bunRequest } from "../extra/bunserver";


const routeBuilder = impl.service(actions).context(bunRequest)

const get = routeBuilder.implements(
  'get.users',
  derive(getConnection, async (db) => async () => {
    return db.select().from(identity);
  }),
);

const create = routeBuilder.implements(
  'create.user',
  derive(getConnection, async (db) => async ({ input }) => {
    await db.insert(identity).values(input);
  }),
  httpMeta({ method: 'POST' })
);

const hello = routeBuilder.implements(
  'hello',
  provide(() => () => "hello")
);

export const routes = [get, create, hello];