import { provide } from "@pumped-fn/core-next"

export const env = provide(() => process.env.NODE_ENV === "prod" ? "prod" : "dev")