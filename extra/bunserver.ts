import { findValue, mvalue, resource, validateInput, type Executor } from "@pumped-fn/core"
import type { Impl } from "@pumped-fn/extra"
import { type BunRequest, type RouterTypes, serve } from "bun"
import { httpMeta } from "./http"

const defaultHttpMeta = httpMeta.partial({ method: "GET", prefix: "/api" })

export const createServer = (routes: Executor<Impl.AnyAPI>[]) => {

  const bunConfig = mvalue({
    port: 3000
  })

  const routesWithMeta = routes.map(route => route.envelop)

  const startServer = resource(
    [bunConfig, ...routesWithMeta],
    async ([config, ...routes]) => {
      const bunRoutes = routes.reduce((acc, route) => {
        const { method, prefix, path } = Object.assign({}, defaultHttpMeta, findValue(route, httpMeta))

        const { handler, context } = route.content

        const applyingPath = `${prefix}${path ?? `/${route.content.path}`}`

        const currentSetting = acc[applyingPath] ?? {}
        acc[applyingPath] = currentSetting

        if (currentSetting[method]) {
          throw new Error("Duplicate route found", { cause: { path: applyingPath, method } })
        }

        currentSetting[method] = async (request: BunRequest<string>): Promise<Response> => {
          const validatedContext = context ? await validateInput(context, request) : undefined

          const body = request.body ? await request.json() : undefined
          const validatedInput = await validateInput(route.content.input, body)
          const response = await handler(validatedContext, validatedInput)
          const validatedOutput = await validateInput(route.content.output, response)

          if (validatedOutput) {
            return Response.json(validatedOutput)
          }

          return new Response(undefined, { status: 200 })
        }

        return acc
      }, {} as Record<string, RouterTypes.RouteHandlerObject<string>>)

      const server = serve({
        port: config.port,
        routes: bunRoutes
      })

      return [server, async () => {
        await server.stop(true)
      }] as const
    })

  return {
    startServer
  }
}