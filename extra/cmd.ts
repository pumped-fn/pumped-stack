import { type Command, program } from "@commander-js/extra-typings"
import { custom, derive, meta, provide, type Core } from "@pumped-fn/core-next"

export const cmdMeta = meta(Symbol("cmd"), custom<Command>())

const allHasCmd = (executors: Core.Executor<any>[]): boolean => {
  return executors.every(executor => cmdMeta.find(executor) !== undefined)
}

export const start = (...integrations: Core.Executor<unknown>[]) => {
  if (!allHasCmd(integrations)) {
    throw new Error("No cmd integration found")
  }

  const lazier = integrations.map(integrations => integrations.lazy)

  return derive(
    lazier,
    async (integrations) => {
      for (const integration of integrations) {
        const cmd = cmdMeta.find(integration)
        if (cmd) {
          program
            .addCommand(cmd.action(async () => {
              const handler = await integration.resolve()
              


            }))
        }
      }
  
      await program.parseAsync()
    
    }
  )
}