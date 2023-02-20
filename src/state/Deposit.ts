import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { nanoid } from 'nanoid';
import { getYear, subMonth, YYYY, YYYYMM } from '../utils/date';
import { Period } from '../utils/date';
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
  startDate: YYYYMM | typeof START
  period: Period
  repeating: boolean
  endDate: YYYYMM | typeof RETIREMENT | null

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, startDate, repeating, endDate, period }:
      Pick<Deposit, 'id' | 'account' | 'amount' | 'startDate' | 'repeating' | 'endDate' | 'period'>
  ) {
    makeAutoObservable(this, { store: false, strategy: false }, { autoBind: true })

    this.store = store
    this.strategy = strategy

    this.id = id
    this.account = account
    this.amount = amount
    this.startDate = startDate
    this.period = period
    this.repeating = repeating
    this.endDate = endDate
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

  static getDescription({ amount, period }: Pick<DepositJSON, 'amount' | 'period'>) {
    return `£${amount} / ${period === Period.YEAR ? 'year' : 'month'}`
  }

  get monthlyAmount() {
    return this.period === Period.YEAR ? this.amount / 12 : this.amount
  }

  get startDateValue() {
    return this.startDate === START ? this.store.start : this.startDate
  }

  get endDateValue() {
    return this.endDate === RETIREMENT ? this.store.retireOn : this.endDate
  }

  get description() {
    return Deposit.getDescription(this)
  }

  isValidOn = computedFn((date: YYYYMM): boolean =>{
    const isSingleDeposit = !this.repeating && this.startDateValue === date
    const isRepeatingDeposit = this.repeating && this.endDateValue
      && this.startDateValue <= date && date < this.endDateValue

    return Boolean(isSingleDeposit || isRepeatingDeposit)
  })

  isValidIn = computedFn((year: YYYY): boolean =>{
    const isSingleDeposit = !this.repeating && getYear(this.startDateValue) === year
    const isRepeatingDeposit = this.repeating && this.endDateValue
      && getYear(this.startDateValue) <= year && year <= getYear(subMonth(this.endDateValue))

    return Boolean(isSingleDeposit || isRepeatingDeposit)
  })

  getValue = computedFn((date: YYYYMM) => {
    if (!this.isValidOn(date)) return 0

    return this.period === Period.YEAR ? this.amount / 12 : this.amount
  })

  restore(json: DepositJSON, copy?: boolean) {
    const { account: accountId, amount, startDate, repeating, endDate, period } = json

    this.account = this.store.accounts.get(accountId)
    this.amount = amount
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.period = period
  }

  get json() {
    return {
      id: this.id,
      amount: this.amount,
      startDate: this.startDate,
      repeating: this.repeating,
      endDate: this.endDate,
      period: this.period,
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}