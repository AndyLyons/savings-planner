import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { assign } from '../../utils/fn'
import { State, useSelector } from '../app'
import { PersonId } from './people'

export type AccountId = string & { __accountId__: never }

export type Account = {
  id: AccountId
  name: string
  growth: number
  owner: PersonId
}

export type AccountUpdate = Omit<Account, 'id'>

export type AccountsState = {
  accounts: Record<AccountId, Account>

  createAccount: (details: AccountUpdate) => AccountId
  removeAccount: (id: AccountId) => void
  editAccount: (id: AccountId, details: Partial<AccountUpdate>) => void
}

export const isAccountId = (
  accountId: string | undefined,
  accounts: AccountsState['accounts'],
): accountId is AccountId =>
  Boolean(accountId && accountId in accounts)

export const useIsAccountId = (
  accountId?: string
): accountId is AccountId =>
  useSelector(
    state => isAccountId(accountId, state.accounts),
    [accountId]
  )

export function createAccountsSlice(set: SetState<State>, get: GetState<State>): AccountsState {
  return ({
    accounts: {},

    createAccount(details) {
      const id = nanoid(10) as AccountId

      set(state => {
        state.accounts[id] = { id, ...details }
      })

      return id
    },
    removeAccount(id) {
      set(state => {
        Object.values(state.balances)
          .filter(balance => balance.account === id)
          .forEach(balance => {
            delete state.balances[balance.id]
          })
        delete state.accounts[id]
      })
    },
    editAccount(id, details) {
      set(state => {
        assign(state.accounts[id], details)
      })
    }
  })
}