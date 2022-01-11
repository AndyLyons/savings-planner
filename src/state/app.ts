import { DependencyList, useCallback } from 'react'
import create, { EqualityChecker } from 'zustand'
import { persist } from 'zustand/middleware'
import { useBind } from '../utils/hooks'
import { immer } from './middleware'
import { migrate } from './migrate'
import { createPeopleSlice, PeopleState } from './slices/people'
import { AccountsState, createAccountsSlice } from './slices/accounts'

export type State = PeopleState & AccountsState

export const useApp = create<State>(
  persist(
    immer((set, get) => ({
      ...createPeopleSlice(set, get),
      ...createAccountsSlice(set, get)
    })),
    {
      name: 'app-storage',
      version: 5,
      migrate
    }
  )
)

export const useSelector = <T>(
  selector: (state: State) => T,
  deps: DependencyList = [],
  equalityFn?: EqualityChecker<T>
) => useApp(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(selector, deps),
    equalityFn
  )

export const useAction = <
    Deps extends readonly any[],
    Params extends readonly any[],
    R
>(
    actionSelector: (state: State) => (...params: [...Deps, ...Params]) => R,
    ...deps: Deps
  ) => useBind(
    useSelector(actionSelector),
    ...deps
  )