import { makeAutoObservable } from 'mobx'
import { YYYYMM } from '../utils/date'
import { entries, keys } from '../utils/fn'
import type { BalanceDetails } from './Balance'
import { Balance } from './Balance'
import type { Store } from './Store'

export type BalancesJSON = typeof Balances.prototype.json

export class Balances {
  store: Store

  data: Record<YYYYMM, Balance> = {}

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  get entries() {
    return entries(this.data)
  }

  addBalance(details: BalanceDetails) {
    const balance = Balance.create(this.store, details)
    this.data[balance.date] = balance
  }

  clear() {
    keys(this.data).forEach(key => {
      delete this.data[key]
    })
  }

  getBalance(date: YYYYMM): Balance {
    return this.data[date]
  }

  removeBalance(balance: Balance): void
  removeBalance(date: YYYYMM): void
  removeBalance(balanceOrDate: Balance | YYYYMM) {
    const date = balanceOrDate instanceof Balance ? balanceOrDate.date : balanceOrDate
    delete this.data[date]
  }

  restoreSnapshot(snapshot: BalancesJSON) {
    this.clear()

    snapshot
      .map(balance => Balance.fromJSON(this.store, balance))
      .forEach(this.addBalance)
  }

  get json() {
    return Object.values(this.data).map(balance => balance.toJSON())
  }

  toJSON() {
    return this.json
  }
}