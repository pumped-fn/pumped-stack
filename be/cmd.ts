import { Command } from "@commander-js/extra-typings";
import { routes } from "./routes";
import { createServer } from "../extra/bunserver";
import { cmdMeta, start } from "../extra/cmd";

const serveCmd = cmdMeta(
  new Command('serve')
    .description('start server')
    .option('-p, --port <port>', 'Port to run the server on', '4000')
)

const bunServer = createServer(routes, serveCmd);

export const app = start(
  bunServer.startServer
)