import { makeAutoObservable } from 'mobx';
import type { YYYYMM } from '../utils/date';
import { extract } from '../utils/fn';
import type { Account } from './Account';
import type { Period, Store } from './Store';

export type DepositDetails = {
  account: Account
  amount: number
  startDate: YYYYMM
  endDate: YYYYMM | null
  period: Period
}

export const RETIREMENT = '__RETIREMENT__'

export type DepositJSON = typeof Deposit.prototype.json

export class Deposit {
  store: Store
  account: Account
  amount: number
  startDate: YYYYMM
  endDate: YYYYMM | typeof RETIREMENT | null
  period: Period | null

  constructor(store: Store, { account, amount, startDate, endDate, period }: DepositDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.account = account
    this.amount = amount
    this.startDate = startDate
    this.endDate = endDate
    this.period = period
  }

  get json() {
    return {
      ...extract(this, 'amount', 'startDate', 'endDate', 'period'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}