import { provide, resource } from "@pumped-fn/core";
import { zod, drizzle, bunSqlite, bun, path, drizzleMigrate } from "../deps";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { Database } from "bun:sqlite";

const dbConfig = provide([zod], async ([zod]) => {
	return zod
		.object({
			dbDir: zod.string(),
			defaultDbName: zod.string().default("main"),
		})
		.parse({
			dbDir: process.env.DATABASE_DIR,
			defaultDbName: process.env.DATABASE_DEFAULT_NAME,
		});
});

const tools = provide(
	[dbConfig, bunSqlite, drizzle, path, drizzleMigrate],
	async ([dbConfig, bunSqlite, drizzle, path, drizzleMigrate]) => {
		return {
			createConnection: async (id: string = dbConfig.defaultDbName) => {
				const dbPath = path.join(dbConfig.dbDir, `${id}.sqlite`);
				const db = new bunSqlite.Database(dbPath);
				const connection = drizzle.drizzle(db);
				drizzleMigrate.migrate(connection, { migrationsFolder: "./drizzle" });

				return { connection, db };
			},
		};
	},
);

export const getConnection = resource(
	[tools, dbConfig],
	async ([dbUtil, dbConfig]) => {
		const pool = new Map<string, [BunSQLiteDatabase, Database]>();

		return [
			async (id: string = dbConfig.defaultDbName) => {
				if (pool.has(id)) {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					return pool.get(id)![0];
				}

				const { connection, db } = await dbUtil.createConnection(id);
				pool.set(id, [connection, db]);

				return connection;
			},
			() => {
				for (const [_, db] of pool.values()) {
					db.close();
				}

				pool.clear();
			},
		];
	},
);
