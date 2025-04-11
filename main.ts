import { createScope, resolveOnce } from "@pumped-fn/core";
import { routes } from "./be/"
import { createServer } from "./extra/bunserver"

const scope = createScope();

const bunServer = createServer(routes)
await resolveOnce(scope, bunServer)

process.on("SIGINT", async () => {
  await scope.dispose();
});

process.on("unhandledRejection", async (reason) => {
  console.error("Unhandled rejection:", reason);
  await scope.dispose();
});
