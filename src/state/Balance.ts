import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Account } from './Account'
import type { Store } from './Store'

export type BalanceId = string & { __balanceId__: never }

export type BalanceDetails = {
  id: BalanceId
  value: number
  date: YYYYMM
  account: Account
}

export type BalanceJSON = typeof Balance.prototype.json

export class Balance {
  store: Store

  id: BalanceDetails['id']
  value: BalanceDetails['value']
  date: BalanceDetails['date']
  account: BalanceDetails['account']

  constructor(store: Store, { id, value, date, account }: BalanceDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.value = value
    this.date = date
    this.account = account
  }

  static create(store: Store, details: Omit<BalanceDetails, 'id'>) {
    return new Balance(store, {
      id: nanoid(10) as BalanceId,
      ...details
    })
  }

  static fromJSON(store: Store, json: BalanceJSON) {
    const account = store.accounts.getAccount(json.account)
    return new Balance(store, { ...json, account })
  }

  get json() {
    return {
      ...extract(this, 'id', 'date', 'value'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}