import produce from 'immer'
import { State, StateCreator } from 'zustand'

export function immer<T extends State>(configure: StateCreator<T>): StateCreator<T> {
  return (set, get, api) => {
    const immerSet = (partial: any, replace?: boolean) => {
      const nextState = typeof partial === 'function'
        ? produce(partial)
        : partial
      return set(nextState, replace)
    }

    return configure(immerSet, get, api)
  }
}