import { executionValue, provide, resource } from "@pumped-fn/core";
import { zod, drizzle, bunSqlite, path, drizzleMigrate } from "./deps";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { Database } from "bun:sqlite";
import { logger } from "./exec";
import { z } from "zod";

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

const connectionPool = resource(dbConfig, () => {
  const pool = new Map<string, [BunSQLiteDatabase, Database]>();

  return [
    pool,
    async () => {
      for (const [_, db] of pool.values()) {
        db.close();
      }

      pool.clear();
    }
  ]
})

export const connectionId = executionValue('dbId', z.string())

export const getConnection = provide(
  [connectionId.finder, drizzleMigrate, drizzle, bunSqlite, path, dbConfig, logger('connection'), connectionPool],
  async ([connectionId, drizzleMigrate, drizzle, bunSqlite, path, dbConfig, logger, connectionPool]) => {
    const id = connectionId || dbConfig.defaultDbName

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