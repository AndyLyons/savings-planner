import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { YYYYMM } from '../utils/date';
import { extract } from '../utils/fn';
import type { Account } from './Account';
import { Period, Store } from './Store';
import { Strategy } from './Strategy';

export type WithdrawalId = string & { __withdrawalId__: never }

export enum WithdrawalType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export const RETIREMENT = '__RETIREMENT__'

export type WithdrawalJSON = typeof Withdrawal.prototype.json

export { WithdrawalIcon } from '../components/icons/WithdrawalIcon';

export class Withdrawal {
  store: Store
  strategy: Strategy

  id: WithdrawalId
  account: Account
  amount: number
  type: WithdrawalType
  startDate: YYYYMM | typeof RETIREMENT
  repeating: boolean
  endDate: YYYYMM | null
  period: Period | null
  taxRate: number

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, type, startDate, repeating, endDate, period, taxRate }:
      Pick<Withdrawal, 'id' | 'account' | 'amount' | 'type' | 'startDate' | 'repeating' | 'endDate' | 'period' | 'taxRate'>
  ) {
    makeAutoObservable(this, { store: false, account: false }, { autoBind: true })

    this.store = store
    this.strategy = strategy

    this.id = id
    this.account = account
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.period = period
    this.taxRate = taxRate
  }

  static createId() {
    return nanoid(10) as WithdrawalId
  }

  static fromJSON(store: Store, strategy: Strategy, json: WithdrawalJSON, copy?: boolean) {
    const { id, account, ...rest } = json

    return new Withdrawal(store, strategy, {
      id: copy ? Withdrawal.createId() : id,
      account: store.accounts.get(account),
      ...rest
    })
  }

  get startDateValue() {
    return this.startDate === RETIREMENT ? this.store.retireOn : this.startDate
  }

  get monthlyAmount() {
    if (this.period === Period.YEAR) {
      return this.type === WithdrawalType.FIXED ? this.amount : this.amount / 100
    }

    return this.type === WithdrawalType.FIXED ? this.amount / 12 : (Math.pow(1 + this.amount / 100, 1/12) - 1)
  }

  restore(json: WithdrawalJSON, copy?: boolean) {
    const { account, amount, type, startDate, repeating, endDate, period, taxRate } = json

    this.account = this.store.accounts.get(account)
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.period = period
    this.taxRate = taxRate
  }

  get json() {
    return {
      ...extract(this, 'id', 'amount', 'type', 'startDate', 'repeating', 'endDate', 'period', 'taxRate'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}