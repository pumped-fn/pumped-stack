import { custom, derive, provide, validate, type Core, type Meta } from "@pumped-fn/core-next"
import type { Def, Impl } from "@pumped-fn/extra"
import { type BunRequest, type RouterTypes, serve } from "bun"
import { httpMeta } from "./http"
import html from "../fe/index.html"

const defaultHttpMeta = httpMeta.partial({ method: "POST", prefix: "/api" })
export const bunRequest = custom<BunRequest<string>>()

export const createServer = <K extends Core.Executor<Impl.API<any, any, BunRequest>>[]>(
  routes: K,
  ...metas: Meta.Meta[]
) => {

  const bunConfig = provide(() => ({ port: 3000 }))

  const routesWithMeta = routes.map(route => route.static)

  const startServer = derive(
    [bunConfig, ...routesWithMeta],
    async ([config, ...routes], controller) => {
      const bunRoutes = routes.reduce((acc, route) => {
        const { method, prefix, path } = Object.assign({}, defaultHttpMeta, httpMeta.find(route))

        const router = route.get()

        const applyingPath = `${prefix}${path ?? `/${router.path}`}`

        const currentSetting = acc[applyingPath] ?? {}
        acc[applyingPath] = currentSetting

        if (currentSetting[method]) {
          throw new Error("Duplicate route found", { cause: { path: applyingPath, method } })
        }

        currentSetting[method] = async (request: BunRequest<string>): Promise<Response> => {
          const validatedContext = router.context ? validate(router.context, request) : undefined
          if (!validatedContext) {
            return new Response("Invalid context", { status: 400 })
          }

          const body = request.body ? await request.json() : undefined
          const validatedInput = validate(router.def.input, body)

          const response = await router.handler({ context: validatedContext, input: validatedInput })

          const validatedOutput = validate(router.def.output, response)

          if (validatedOutput) {
            return Response.json(validatedOutput)
          }

          return new Response(undefined, { status: 200 })
        }

        return acc
      }, {} as Record<string, RouterTypes.RouteHandlerObject<string>>)

      console.log("Starting server on port with routes", config.port, bunRoutes)

      const server = serve({
        port: config.port,
        routes: {
          ...bunRoutes,
          "/": html
        }
      })

      controller.cleanup(() => {
        console.log("Stopping server")
        server.stop(true)
      })

      return server
    }, ...metas)

  return {
    startServer
  }
}