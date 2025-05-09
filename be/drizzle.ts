import { derive } from "@pumped-fn/core-next";
import { zod, drizzle, bunSqlite, path, drizzleMigrate } from "./deps";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { Database } from "bun:sqlite";
import { logger } from "./exec";

const dbConfig = derive([zod], async ([zod]) => {
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

const connectionPool = derive(dbConfig, (config, controller) => {

  const pool = new Map<string, [BunSQLiteDatabase, Database]>();

  controller.cleanup(() => {
    for (const [_, db] of pool.values()) {
      db.close();
    }

    pool.clear();
  })

  return pool
})

export const getConnection = derive(
  [drizzleMigrate, drizzle, bunSqlite, path, dbConfig, logger('connection'), connectionPool] as const,
  async ([drizzleMigrate, drizzle, bunSqlite, path, dbConfig, logger, connectionPool]) => {
    const id = dbConfig.defaultDbName

    if (connectionPool.has(id)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return connectionPool.get(id)![0];
    }

    const dbPath = path.join(dbConfig.dbDir, `${id}.sqlite`);
    const db = new (bunSqlite.Database)(dbPath);

    const connection = drizzle.drizzle(db, {
      logger: {
        logQuery(query, params) {
          logger(query, params)
        },
      }
    });

    drizzleMigrate.migrate(connection, { migrationsFolder: "./drizzle" });

    connectionPool.set(id, [connection, db]);

    return connection;
  }
)