import { DependencyList, useCallback, useRef } from 'react';

type Cleanup = () => void
type CallbackRef<E extends Element> = (element: E) => Cleanup | undefined

export function useCallbackRef<E extends Element>(callback: CallbackRef<E>, deps: DependencyList) {
  const cleanup = useRef<Cleanup>()
  return useCallback((element: E) => {
    cleanup.current?.()
    cleanup.current = callback(element)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useBind<
    B extends readonly any[],
    P extends readonly any[],
    R
>(callback: (...params: [...B, ...P]) => R, ...bound: B) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((...params: P) => callback(...bound, ...params), [callback, ...bound])
}

type PreventableEvent = {
  stopPropagation: () => void
}

export function useStopPropagation<E extends PreventableEvent>(callback: (event: E) => void) {
  return useCallback((e: E) => {
    e.stopPropagation()
    callback(e)
  }, [callback])
}