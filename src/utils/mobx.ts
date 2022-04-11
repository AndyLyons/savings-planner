import { action, computed } from 'mobx'
import { DependencyList, EffectCallback, useContext, useEffect, useMemo } from 'react'
import { Store, StoreContext } from '../state/Store'
import { UI, UIContext } from '../state/UI'

export function useStore(): Store
export function useStore<T>(selector: (store: Store) => T): T
export function useStore<T>(selector?: (store: Store) => T): T | Store {
  const store = useContext(StoreContext)
  return selector ? selector(store) : store
}

export function useUI(): UI
export function useUI<T>(selector: (ui: UI) => T): T
export function useUI<T>(selector?: (ui: UI) => T): T | UI {
  const ui = useContext(UIContext)
  return selector ? selector(ui) : ui
}

export const useComputed = <T>(compute: (store: Store) => T, deps: DependencyList) => {
  const store = useStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => computed(() => compute(store)), [store, ...deps]).get()
}

export const useAction = <T extends Array<unknown>, R>(callback: (store: Store, ...params: T) => R, deps: DependencyList) => {
  const store = useStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => action((...params: T) => callback(store, ...params)), [store, ...deps])
}

export const useActionEffect = (
  effect: EffectCallback,
  deps?: DependencyList
// eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(action(() => {
  const cleanup = effect()
  return typeof cleanup === 'function' ? action(cleanup) : cleanup
}), deps)