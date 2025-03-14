import { provide } from "@pumped-fn/core";

export const zod = provide(async () => {
  return await import("zod");
});

export const drizzle = provide(async () => {
  return await import("drizzle-orm/bun-sqlite");
});

export const drizzleMigrate = provide(async () => {
  return await import("drizzle-orm/bun-sqlite/migrator");
});

export const pg = provide(async () => {
  return await import("pg");
});

export const dockerode = provide(async () => {
  return await import("dockerode");
});

export const bun = provide(async () => {
  return await import("bun");
});

export const bunSqlite = provide(async () => {
  return await import("bun:sqlite");
});

export const path = provide(async () => {
  return await import("node:path");
});
