import { makeAutoObservable } from 'mobx'
import { keys } from '../utils/fn'
import type { AccountDetails, AccountId } from './Account'
import { Account } from './Account'
import type { Store } from './Store'

export type AccountsJSON = typeof Accounts.prototype.json

export class Accounts {
  store: Store

  data: Record<AccountId, Account> = {}

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  get values() {
    return Object.values(this.data)
  }

  addAccount(details: Omit<AccountDetails, 'id'>) {
    const account = Account.create(this.store, details)
    this.data[account.id] = account
  }

  clear() {
    keys(this.data).forEach(key => {
      delete this.data[key]
    })
  }

  getAccount(accountId: AccountId): Account {
    return this.data[accountId]
  }

  isAccountId(accountId: string | undefined): accountId is AccountId {
    return accountId !== undefined && accountId in this.data
  }

  removeAccount(account: Account): void
  removeAccount(accountId: AccountId): void
  removeAccount(accountOrId: Account | AccountId) {
    const id = typeof accountOrId === 'string' ? accountOrId : accountOrId.id
    delete this.data[id]
  }

  restoreSnapshot(snapshot: AccountsJSON) {
    this.clear()

    snapshot
      .map(account => Account.fromJSON(this.store, account))
      .forEach(this.addAccount)
  }

  get json() {
    return this.values.map(account => account.toJSON())
  }

  toJSON() {
    return this.json
  }
}