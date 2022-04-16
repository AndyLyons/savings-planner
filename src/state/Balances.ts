import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { YYYYMM } from '../utils/date'
import { subMonth } from '../utils/date'
import { entries, keys } from '../utils/fn'
import type { Account } from './Account'
import type { BalanceDetails } from './Balance'
import { Balance } from './Balance'
import type { Store } from './Store'

export type BalancesJSON = typeof Balances.prototype.json

export class Balances {
  store: Store
  account: Account

  data: Record<YYYYMM, Balance> = {}

  constructor(store: Store, account: Account) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
    this.account = account
  }

  get entries() {
    return entries(this.data)
  }

  addBalance(balance: Balance) {
    this.data[balance.date] = balance
  }

  createBalance(details: BalanceDetails) {
    const balance = Balance.create(this.store, this.account, details)
    this.addBalance(balance)
  }

  clear() {
    keys(this.data).forEach(key => {
      delete this.data[key]
    })
  }

  getBalance(date: YYYYMM): Balance | undefined {
    return this.data[date]
  }

  interpolateBalance = computedFn((date: YYYYMM): number | undefined => {
    if (date === this.store.start) {
      return undefined
    }

    const previousDate = subMonth(date)

    const previousBalance = this.getBalance(previousDate)?.value ?? this.interpolateBalance(previousDate)

    if (previousBalance === undefined) {
      return undefined
    }

    return previousBalance * (1 + this.account.mer)
  })

  removeBalance(balance: Balance): void
  removeBalance(date: YYYYMM): void
  removeBalance(balanceOrDate: Balance | YYYYMM) {
    const date = balanceOrDate instanceof Balance ? balanceOrDate.date : balanceOrDate
    delete this.data[date]
  }

  restoreSnapshot(snapshot: BalancesJSON) {
    this.clear()

    snapshot
      .map(balance => Balance.fromJSON(this.store, this.account, balance))
      .forEach(this.addBalance)
  }

  get json() {
    return Object.values(this.data).map(balance => balance.toJSON())
  }

  toJSON() {
    return this.json
  }
}