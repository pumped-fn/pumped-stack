import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const identity = sqliteTable("identity", {
	id: text()
		.$defaultFn(() => createId())
		.primaryKey(),
	username: text().notNull(),
	email: text(),
});
