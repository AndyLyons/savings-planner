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

  get keys() {
    return keys(this.data)
  }

  get values() {
    return Object.values(this.data)
  }

  addAccount(account: Account) {
    this.data[account.id] = account
  }

  createAccount(details: Omit<AccountDetails, 'id'>) {
    this.addAccount(Account.create(this.store, details))
  }

  clear() {
    this.keys.forEach(key => {
      delete this.data[key]
    })
  }

  getAccount(accountId: AccountId): Account {
    return this.data[accountId]
  }

  isAccountId(accountId: string | undefined): accountId is AccountId {
    return accountId !== undefined && accountId in this.data
  }

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