import { createScope } from "@pumped-fn/core-next";
import { app } from "./be/cmd"

const scope = createScope();

await scope.resolve(app)

process.on("SIGINT", async () => {
  await scope.dispose();
});

process.on("unhandledRejection", async (reason) => {
  console.error("Unhandled rejection:", reason);
  await scope.dispose();
});
