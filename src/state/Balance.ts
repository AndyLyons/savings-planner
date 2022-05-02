import { CurrencyPound } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { YYYY } from '../utils/date'
import { extract } from '../utils/fn'
import type { Account } from './Account'
import type { Store } from './Store'

export type BalanceJSON = typeof Balance.prototype.json

export const BalanceIcon = CurrencyPound

export class Balance {
  store: Store
  account: Account

  year: YYYY
  value: number

  constructor(
    store: Store,
    account: Account,
    { year, value }:
      Pick<Balance, 'year' | 'value'>
  ) {
    makeAutoObservable(this, { store: false, account: false }, { autoBind: true })

    this.store = store
    this.account = account

    this.year = year
    this.value = value
  }

  static fromJSON(store: Store, account: Account, json: BalanceJSON, copy?: boolean) {
    return new Balance(store, account, json)
  }

  restore({ year, value }: BalanceJSON, copy?: boolean) {
    this.year = year
    this.value = value
  }

  get json() {
    return extract(this, 'year', 'value')
  }

  toJSON() {
    return this.json
  }
}