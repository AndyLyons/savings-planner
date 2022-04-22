import { makeAutoObservable } from 'mobx';
import type { YYYYMM } from '../utils/date';
import { extract } from '../utils/fn';
import type { Account } from './Account';
import type { Period, Store } from './Store';

enum WithdrawalType {
  FIXED = 'FIXED',
  FIXED_PERCENTAGE = 'FIXED_PERCENTAGE',
  PERCENTAGE = 'PERCENTAGE'
}

export type WithdrawalDetails = {
  account: Account
  amount: number
  type: WithdrawalType
  startDate: YYYYMM
  endDate: YYYYMM | null
  period: Period
  taxRate: number
}

export const RETIREMENT = '__RETIREMENT__'

export type WithdrawalJSON = typeof Withdrawal.prototype.json

export class Withdrawal {
  store: Store
  account: Account
  amount: number
  startDate: YYYYMM
  endDate: YYYYMM | typeof RETIREMENT | null
  period: Period | null

  constructor(store: Store, { account, amount, startDate, endDate, period }: WithdrawalDetails) {
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