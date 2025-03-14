import { provide } from "@pumped-fn/core"

export const env = provide(() => process.env.NODE_ENV === "prod" ? "prod" : "dev")