import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { YYYY } from '../utils/date';
import { extract } from '../utils/fn';
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
  startYear: YYYY | typeof RETIREMENT
  repeating: boolean
  endYear: YYYY | null
  taxRate: number

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, type, startYear, repeating, endYear, taxRate }:
      Pick<Withdrawal, 'id' | 'account' | 'amount' | 'type' | 'startYear' | 'repeating' | 'endYear' | 'taxRate'>
  ) {
    makeAutoObservable(this, { store: false, account: false }, { autoBind: true })

    this.store = store
    this.strategy = strategy

    this.id = id
    this.account = account
    this.amount = amount
    this.type = type
    this.startYear = startYear
    this.repeating = repeating
    this.endYear = endYear
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

  get startYearValue() {
    return this.startYear === RETIREMENT ? this.store.retireOn : this.startYear
  }

  get amountValue() {
    return this.amount === null ? this.store.globalGrowth : this.amount
  }

  get normalisedAmount() {
    if (this.type === WithdrawalType.FIXED_PER_MONTH) {
      return this.amountValue * 12
    }

    if (this.type === WithdrawalType.PERCENTAGE || this.type === WithdrawalType.STATIC_PERCENTAGE) {
      return this.amountValue / 100
    }

    return this.amountValue
  }

  restore(json: WithdrawalJSON, copy?: boolean) {
    const { account, amount, type, startYear, repeating, endYear, taxRate } = json

    this.account = this.store.accounts.get(account)
    this.amount = amount
    this.type = type
    this.startYear = startYear
    this.repeating = repeating
    this.endYear = endYear
    this.taxRate = taxRate
  }

  get json() {
    return {
      ...extract(this, 'id', 'amount', 'type', 'startYear', 'repeating', 'endYear', 'taxRate'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}