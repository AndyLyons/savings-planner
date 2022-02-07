import { DependencyList, useCallback } from 'react'
import create, { EqualityChecker } from 'zustand'
import shallow from 'zustand/shallow'
import { persist } from 'zustand/middleware'
import { useBind } from '../utils/hooks'
import { immer } from './middleware'
import { migrate } from './migrate'
import { AccountsState, createAccountsSlice } from './slices/accounts'
import { createPeopleSlice, PeopleState } from './slices/people'
import { YYYYMM } from '../utils/date'

export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

interface Balance {
  date: YYYYMM
}

export interface GlobalState {
  balances: Array<Balance>
  period: Period
  showAges: boolean
  showAccounts: boolean
  showHistory: boolean

  setPeriod: (period: Period) => void
  toggleShowAges: () => void
  toggleShowAccounts: () => void
  toggleShowHistory: () => void
}

export type State = PeopleState & AccountsState & GlobalState

export const useApp = create<State>(
  persist(
    immer((set, get) => ({
      ...createPeopleSlice(set, get),
      ...createAccountsSlice(set, get),

      balances: [],
      period: Period.YEAR,
      showAges: false,
      showAccounts: false,
      showHistory: true,

      setPeriod(period) {
        set(state => {
          state.period = period
        })
      },

      toggleShowAges() {
        set(state => {
          state.showAges = !state.showAges
        })
      },

      toggleShowAccounts() {
        set(state => {
          state.showAccounts = !state.showAccounts
        })
      },

      toggleShowHistory() {
        set(state => {
          state.showHistory = !state.showHistory
        })
      }
    })),
    {
      name: 'app-storage',
      version: 6,
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

export const useSelectorShallow = <T>(
  selector: (state: State) => T,
  deps: DependencyList = []
) => useSelector(selector, deps, shallow)

export const useBindSelector = <
    Deps extends DependencyList,
    Params extends readonly any[],
    R
>(
    actionSelector: (state: State) => (...params: [...Deps, ...Params]) => R,
    ...deps: Deps
  ) => useBind(
    useSelector(actionSelector),
    ...deps
  )