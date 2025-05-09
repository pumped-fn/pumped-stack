import { derive, provide } from "@pumped-fn/core-next"
import type { Identity } from "../drizzle/types"

const selectedTodo = provide(() => undefined as Identity | undefined)

const setSelectedTodo = derive(selectedTodo.static, (selectedTodo) => {
  return (todo: Identity | undefined) => {
    return selectedTodo.update(todo)
  }
})

export const appPumped = {
  selectedTodo,
  setSelectedTodo
}