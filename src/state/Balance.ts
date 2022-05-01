import { CurrencyPound } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Account } from './Account'
import type { Store } from './Store'

export type BalanceJSON = typeof Balance.prototype.json

export const BalanceIcon = CurrencyPound

export class Balance {
  store: Store
  account: Account

  date: YYYYMM
  value: number

  constructor(
    store: Store,
    account: Account,
    { date, value }:
      Pick<Balance, 'date' | 'value'>
  ) {
    makeAutoObservable(this, { store: false, account: false }, { autoBind: true })

    this.store = store
    this.account = account

    this.date = date
    this.value = value
  }

  static fromJSON(store: Store, account: Account, json: BalanceJSON, copy?: boolean) {
    return new Balance(store, account, json)
  }

  restore({ date, value }: BalanceJSON, copy?: boolean) {
    this.date = date
    this.value = value
  }

  get json() {
    return extract(this, 'date', 'value')
  }

  toJSON() {
    return this.json
  }
}