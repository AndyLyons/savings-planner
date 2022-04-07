import { action, computed } from 'mobx'
import React, { DependencyList } from 'react'
import { Store, StoreContext } from '../state/Store'

export function useStore(): Store
export function useStore<T>(selector: (store: Store) => T): T
export function useStore<T>(selector?: (store: Store) => T): T | Store {
  const store = React.useContext(StoreContext)
  return selector ? selector(store) : store
}

export const useComputed = <T>(compute: (store: Store) => T, deps: DependencyList) => {
  const store = useStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => computed(() => compute(store)), [store, ...deps]).get()
}

export const useAction = <T extends Array<unknown>, R>(callback: (store: Store, ...params: T) => R, deps: DependencyList) => {
  const store = useStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => action((...params: T) => callback(store, ...params)), [store, ...deps])
}