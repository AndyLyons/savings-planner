import { action, computed, $mobx, isObservable, makeObservable } from 'mobx'
import { DependencyList, EffectCallback, useContext, useEffect, useMemo } from 'react'
import { $SnapshotKeys } from '../state/model'
import { Store, StoreContext } from '../state/Store'

export function useStore(): Store
export function useStore<T>(selector: (store: Store) => T): T
export function useStore<T>(selector?: (store: Store) => T): T | Store {
  const store = useContext(StoreContext)
  return selector ? selector(store) : store
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


const annotationsSymbol = Symbol('annotationsSymbol');
const objectPrototype = Object.prototype;
const ignoredFields = [$mobx, 'constructor', 'store', $SnapshotKeys]

/**
 * A custom version of `makeAutoObservable` that supports subclassing.
 *
 * This is generally safe to use if you understand the limitations:
 *   - No calling 'makeAutoObservable' or similar in parent classes, only the child implementation should call it
 *   - Only use it on simple, known prototype chains, where you definitely want all the fields from parents to be observed
 *
 * See https://github.com/mobxjs/mobx/discussions/2850
 */
export function makeAutoObservable(target: any, overrides: any = {}, options?: any): void {
  // Make sure nobody called makeObservable/etc. previously (eg in parent constructor)
  if (isObservable(target)) {
    throw new Error('Target must not be observable');
  }

  // Collect all fields from the prototype chain
  let annotations = target[annotationsSymbol];

  if (!annotations) {
    annotations = {};
    let current = target;
    while (current && current !== objectPrototype) {
      Reflect.ownKeys(current).forEach((key) => {
        if (ignoredFields.includes(key)) return
        annotations[key] = key in overrides ? overrides[key] : true;
      });
      current = Object.getPrototypeOf(current);
    }
    // Cache if class
    const proto = Object.getPrototypeOf(target);
    if (proto && proto !== objectPrototype) {
      Object.defineProperty(proto, annotationsSymbol, { value: annotations });
    }
  }

  return makeObservable(target, annotations, options);
}