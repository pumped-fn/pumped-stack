import { meta, type Meta } from "@pumped-fn/core-next"
import { z } from "zod"

const httpDefSchema = z.object({
  method: z.union([z.literal('GET'), z.literal('POST')]).default('GET'),
  path: z.string().optional(),
  prefix: z.string().optional()
})

export const httpMeta = meta(Symbol('http'), httpDefSchema)
export type HttpMeta = typeof httpMeta extends Meta.Meta<infer T> ? T : never