import { DependencyList, useCallback, useRef, useState } from 'react';

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

export function useIf<P extends readonly any[]>(
  predicate: (...params: P) => boolean,
  callback?: (...params: P) => void
) {
  return useCallback((...params: P) => {
    if (predicate(...params)) {
      callback?.(...params)
    }
  }, [callback, predicate])
}

interface PreventableEvent {
  stopPropagation: () => void
  preventDefault: () => void
}

export function useStopEvent<E>(callback?: (event: E) => void) {
  return useCallback((e: PreventableEvent & E) => {
    e.stopPropagation()
    e.preventDefault()
    callback?.(e)
  }, [callback])
}

interface KeyEvent {
  key: string
}

export function useKeyPress<E>(key: string, callback: (event: E) => void) {
  return useCallback((e: KeyEvent & E) => {
    if (e.key === key) {
      callback(e)
    }
  }, [callback, key])
}

export function useBoolean(initialValue: boolean | (() => boolean)) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(value => !value), [])
  return [value, useBind(setValue, true), useBind(setValue, false), toggle] as const
}

type InitialState<T> = T | (() => T)

export function useEventState<T, P extends readonly any[]>(
  initialState: InitialState<T>,
  getEventState: (...params: P) => T | undefined
) {
  const [state, setState] = useState(initialState)

  const onEvent = useCallback((...params: P) => {
    const value = getEventState(...params)
    if (value !== undefined) {
      setState(value)
    }
  }, [getEventState])

  return [state, onEvent, setState] as const
}

export interface ChangeEvent { target: { value: string } }
export interface CheckedEvent { target: { checked: boolean } }
export interface SelectableEvent { target: { select: () => void } }

export const selectTarget = (e: SelectableEvent) => e.target.select()
export const getTargetValue = (e: ChangeEvent) => e.target.value
export const getTargetChecked = (e: CheckedEvent) => e.target.checked
export const useChangeEventState = (initialState: InitialState<string>) => useEventState(initialState, getTargetValue)
export const useCheckedEventState = (initialState: InitialState<boolean>) => useEventState(initialState, getTargetChecked)