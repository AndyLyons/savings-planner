import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { YYYYMM } from '../utils/date';
import { extract } from '../utils/fn';
import type { Account } from './Account';
import type { Period, Store } from './Store';
import type { Strategy } from './Strategy';

export const RETIREMENT = '__RETIREMENT__'

export type DepositId = string & { depositId__: never }

export type DepositDetails = {
  id: DepositId
  account: Account
  amount: number
  startDate: YYYYMM
  repeating: boolean
  endDate: YYYYMM | typeof RETIREMENT | null
  period: Period | null
}

export type DepositJSON = typeof Deposit.prototype.json

export class Deposit {
  store: Store
  strategy: Strategy

  id: DepositId
  account: Account
  amount: number
  startDate: YYYYMM
  repeating: boolean
  endDate: YYYYMM | typeof RETIREMENT | null
  period: Period | null

  constructor(store: Store, strategy: Strategy, { id, account, amount, startDate, repeating, endDate, period }: DepositDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
    this.strategy = strategy

    this.id = id
    this.account = account
    this.amount = amount
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.period = period
  }

  static create(store: Store, strategy: Strategy, details: Omit<DepositDetails, 'id'>) {
    return new Deposit(store, strategy, {
      ...details,
      id: nanoid(10) as DepositId
    })
  }

  static fromJSON(store: Store, strategy: Strategy, { account: accountId, ...details }: DepositJSON) {
    const account = store.accounts.getAccount(accountId)
    return new Deposit(store, strategy, { ...details, account })
  }

  get json() {
    return {
      ...extract(this, 'id', 'amount', 'startDate', 'repeating', 'endDate', 'period'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}