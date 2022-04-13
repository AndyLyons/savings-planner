import { makeAutoObservable } from 'mobx'
import { YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Account } from './Account'
import type { Store } from './Store'

export type BalanceId = string & { __balanceId__: never }

export type BalanceDetails = {
  account: Account
  date: YYYYMM
  value: number
}

export type BalanceJSON = typeof Balance.prototype.json

export class Balance {
  store: Store

  account: BalanceDetails['account']
  date: BalanceDetails['date']
  value: BalanceDetails['value']

  constructor(store: Store, { account, date, value }: BalanceDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.account = account
    this.date = date
    this.value = value
  }

  static create(store: Store, details: BalanceDetails) {
    return new Balance(store, details)
  }

  static fromJSON(store: Store, { account: accountId, ...details }: BalanceJSON) {
    const account = store.accounts.getAccount(accountId)
    return new Balance(store, { ...details, account })
  }

  get json() {
    return {
      ...extract(this, 'date', 'value'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}