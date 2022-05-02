import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { YYYY } from '../utils/date';
import { Period } from '../utils/date';
import { extract } from '../utils/fn';
import type { Account } from './Account';
import { Store } from './Store';
import type { Strategy } from './Strategy';

export const START = '__START__'
export const RETIREMENT = '__RETIREMENT__'

export type DepositId = string & { depositId__: never }

export type DepositJSON = typeof Deposit.prototype.json

export { DepositIcon } from '../components/icons/DepositIcon';

export class Deposit {
  store: Store
  strategy: Strategy

  id: DepositId
  account: Account
  amount: number
  startYear: YYYY | typeof START
  period: Period
  repeating: boolean
  endYear: YYYY | typeof RETIREMENT | null

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, startYear, repeating, endYear, period }:
      Pick<Deposit, 'id' | 'account' | 'amount' | 'startYear' | 'repeating' | 'endYear' | 'period'>
  ) {
    makeAutoObservable(this, { store: false, strategy: false }, { autoBind: true })

    this.store = store
    this.strategy = strategy

    this.id = id
    this.account = account
    this.amount = amount
    this.startYear = startYear
    this.period = period
    this.repeating = repeating
    this.endYear = endYear
  }

  static createId() {
    return nanoid(10) as DepositId
  }

  static fromJSON(store: Store, strategy: Strategy, json: DepositJSON, copy?: boolean) {
    const { id, account: accountId, ...rest } = json

    const account = store.accounts.get(accountId)
    return new Deposit(store, strategy, {
      id: copy ? Deposit.createId() : id,
      account,
      ...rest
    })
  }

  get startYearValue() {
    return this.startYear === START ? this.store.start : this.startYear
  }

  get endYearValue() {
    return this.endYear === RETIREMENT ? this.store.retireOn : this.endYear
  }

  get normalisedAmount() {
    return this.period === Period.MONTH ? this.amount * 12 : this.amount
  }

  restore(json: DepositJSON, copy?: boolean) {
    const { account: accountId, amount, startYear, repeating, endYear, period } = json

    this.account = this.store.accounts.get(accountId)
    this.amount = amount
    this.startYear = startYear
    this.repeating = repeating
    this.endYear = endYear
    this.period = period
  }

  get json() {
    return {
      ...extract(this, 'id', 'amount', 'startYear', 'repeating', 'endYear', 'period'),
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}