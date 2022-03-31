import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { YYYYMM } from '../../utils/date'
import { assign } from '../../utils/fn'
import { State, useSelector } from '../app'
import { AccountId } from './accounts'

export type BalanceId = string & { __balanceId__: never }

export type Balance = {
  id: BalanceId
  account: AccountId
  value: number
  date: YYYYMM
}

export type BalanceUpdate = Omit<Balance, 'id'>

export type BalancesState = {
  balances: Record<BalanceId, Balance>

  createBalance: (details: BalanceUpdate) => BalanceId
  removeBalance: (id: BalanceId) => void
  editBalance: (id: BalanceId, details: Partial<BalanceUpdate>) => void
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
    balances: {},

    createBalance(details) {
      const id = nanoid(10) as BalanceId

      set(state => {
        state.balances[id] = { id, ...details }
      })

      return id
    },
    removeBalance(id) {
      set(state => {
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