import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { YYYYMM } from '../utils/date';
import type { Account } from './Account';
import { Store } from './Store';
import { Strategy } from './Strategy';

export type WithdrawalId = string & { __withdrawalId__: never }

export enum WithdrawalType {
  FIXED_PER_YEAR = 'FIXED_PER_YEAR',
  FIXED_PER_MONTH = 'FIXED_PER_MONTH',
  PERCENTAGE = 'PERCENTAGE',
  STATIC_PERCENTAGE = 'STATIC_PERCENTAGE'
}

export const RETIREMENT = '__RETIREMENT__'

export type WithdrawalJSON = typeof Withdrawal.prototype.json

export { WithdrawalIcon } from '../components/icons/WithdrawalIcon';

export class Withdrawal {
  store: Store
  strategy: Strategy

  id: WithdrawalId
  account: Account
  amount: number | null
  type: WithdrawalType
  startDate: YYYYMM | typeof RETIREMENT
  repeating: boolean
  endDate: YYYYMM | null
  taxRate: number

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, type, startDate, repeating, endDate, taxRate }:
      Pick<Withdrawal, 'id' | 'account' | 'amount' | 'type' | 'startDate' | 'repeating' | 'endDate' | 'taxRate'>
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

  get amountValue() {
    return this.amount === null ? this.store.globalGrowth : this.amount
  }

  restore(json: WithdrawalJSON, copy?: boolean) {
    const { account, amount, type, startDate, repeating, endDate, taxRate } = json

    this.account = this.store.accounts.get(account)
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.taxRate = taxRate
  }

  get json() {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      startDate: this.startDate,
      repeating: this.repeating,
      endDate: this.endDate,
      taxRate: this.taxRate,
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}