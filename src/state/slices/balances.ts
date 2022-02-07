import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { YYYYMM } from '../../utils/date'
import { assign, removeArrayItem } from '../../utils/fn'
import { State, useSelector } from '../app'
import { AccountId } from './accounts'

export type BalanceId = string & { __balanceId__: never }

export interface Balance {
  account: AccountId
  value: number
  date: YYYYMM
}

export interface BalancesState {
  balancesIds: Array<BalanceId>
  balances: Record<BalanceId, Balance>

  createBalance: (details: Balance) => BalanceId
  removeBalance: (id: BalanceId) => void
  editBalance: (id: BalanceId, details: Partial<Balance>) => void
}

export const useIsBalanceId = (
  balanceId?: string
): balanceId is BalanceId =>
  useSelector(
    state => Boolean(balanceId && balanceId in state.balances),
    [balanceId]
  )

export function createBalancesSlice(set: SetState<State>, get: GetState<State>): BalancesState {
  return ({
    balancesIds: [],
    balances: {},

    createBalance(details) {
      const id = nanoid(10) as BalanceId

      set(state => {
        state.balancesIds.push(id)
        state.balances[id] = details
      })

      return id
    },
    removeBalance(id) {
      set(state => {
        removeArrayItem(state.balancesIds, id)
        delete state.balances[id]
      })
    },
    editBalance(id, details) {
      set(state => {
        assign(state.balances[id], details)
      })
    }
  })
}