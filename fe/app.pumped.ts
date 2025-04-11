import { mvalue, provide } from "@pumped-fn/core"
import type { Identity } from "../drizzle/types"

const selectedTodo = mvalue(undefined as Identity | undefined)

const setSelectedTodo = provide(selectedTodo.ref, (ref, scope) => {
  return (todo: Identity | undefined) => {
    return scope.update(ref, todo)
  }
})

export const appPumped = {
  selectedTodo,
  setSelectedTodo
}