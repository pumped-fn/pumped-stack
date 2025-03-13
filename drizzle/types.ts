import type { InferSelectModel } from "drizzle-orm"
import type { identity } from "./schema"

export type Identity = InferSelectModel<typeof identity>