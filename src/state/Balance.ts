import { CurrencyPound } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { YYYYMM } from '../utils/date'
import type { AccountId } from './Account'
import type { Store } from './Store'

export type BalanceSnapshotOut = typeof Balance.prototype.snapshot
export type BalanceSnapshotIn = BalanceSnapshotOut

export const BalanceIcon = CurrencyPound

export class Balance {
  store: Store

  accountId: AccountId
  date: YYYYMM
  value: number

  constructor(
    store: Store,
    { accountId, date, value }: BalanceSnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.accountId = accountId
    this.date = date
    this.value = value
  }

  static create(store: Store, snapshot: BalanceSnapshotIn) {
    return new Balance(store, snapshot)
  }

  get snapshot() {
    return {
      accountId: this.accountId,
      date: this.date,
      value: this.value
    }
  }

  restore({ accountId, date, value }: BalanceSnapshotIn) {
    this.accountId = accountId
    this.date = date
    this.value = value
  }

  get account() {
    return this.store.accounts.get(this.accountId)
  }
}