import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { assign, removeArrayItem } from '../../utils/fn'
import { State, useSelector } from '../app'
import { PersonId } from './people'

export type AccountId = string & { __accountId__: never }

export interface Account {
  name: string
  growth: number
  owner: PersonId
}

export interface AccountsState {
  accountsIds: Array<AccountId>
  accounts: Record<AccountId, Account>

  createAccount: (details: Account) => AccountId
  removeAccount: (id: AccountId) => void
  editAccount: (id: AccountId, details: Partial<Account>) => void
}

export const useIsAccountId = (
  accountId?: string
): accountId is AccountId =>
  useSelector(
    state => Boolean(accountId && accountId in state.accounts),
    [accountId]
  )

export function createAccountsSlice(set: SetState<State>, get: GetState<State>): AccountsState {
  return ({
    accountsIds: [],
    accounts: {},

    createAccount(details) {
      const id = nanoid(10) as AccountId

      set(state => {
        state.accountsIds.push(id)
        state.accounts[id] = details
      })

      return id
    },
    removeAccount(id) {
      set(state => {
        removeArrayItem(state.accountsIds, id)
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