import { provide } from "@pumped-fn/core-next";

export const logger = (name: string) => provide(
  () => {
    return (...messages: unknown[]) => {
      console.log(`[${name}]`, ...messages);
    }
  })
