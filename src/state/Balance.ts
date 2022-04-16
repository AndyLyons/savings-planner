import { makeAutoObservable } from 'mobx'
import { YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Account } from './Account'
import type { Store } from './Store'

export type BalanceId = string & { __balanceId__: never }

export type BalanceDetails = {
  date: YYYYMM
  value: number
}

export type BalanceJSON = typeof Balance.prototype.json

export class Balance {
  store: Store
  account: Account

  date: BalanceDetails['date']
  value: BalanceDetails['value']

  constructor(store: Store, account: Account, { date, value }: BalanceDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.account = account
    this.date = date
    this.value = value
  }

  static create(store: Store, account: Account, details: BalanceDetails) {
    return new Balance(store, account, details)
  }

  static fromJSON(store: Store, account: Account, details: BalanceJSON) {
    return new Balance(store, account, details)
  }

  get json() {
    return extract(this, 'date', 'value')
  }

  toJSON() {
    return this.json
  }
}