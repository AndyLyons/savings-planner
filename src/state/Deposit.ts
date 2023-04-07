import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { nanoid } from 'nanoid';
import { getYear, subMonth, YYYY, YYYYMM } from '../utils/date';
import { Period } from '../utils/date';
import { Optional } from '../utils/object';
import type { AccountId } from './Account';
import { Store } from './Store';
import type { StrategyId } from './Strategy';

export const START = '__START__'
export const RETIREMENT = '__RETIREMENT__'

export type DepositId = string & { depositId__: never }

export type DepositSnapshotOut = typeof Deposit.prototype.snapshot
export type DepositSnapshotIn = Optional<DepositSnapshotOut, 'id'>

export { DepositIcon } from '../components/icons/DepositIcon';

export class Deposit {
  store: Store

  accountId: AccountId
  amount: number
  endDate: YYYYMM | typeof RETIREMENT | null
  id: DepositId
  parentStrategyId: StrategyId
  period: Period
  repeating: boolean
  startDate: YYYYMM | typeof START

  constructor(
    store: Store,
    { id = Deposit.createId(), accountId, amount, startDate, repeating, endDate, period, parentStrategyId }: DepositSnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.parentStrategyId = parentStrategyId
    this.accountId = accountId
    this.amount = amount
    this.startDate = startDate
    this.period = period
    this.repeating = repeating
    this.endDate = endDate
  }

  static createId() {
    return nanoid(10) as DepositId
  }

  static create(store: Store, snapshot: DepositSnapshotIn) {
    return new Deposit(store, snapshot)
  }

  static getDescription({ amount, period }: Pick<DepositSnapshotIn, 'amount' | 'period'>) {
    return `£${amount} / ${period === Period.YEAR ? 'year' : 'month'}`
  }

  get snapshot() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      endDate: this.endDate,
      id: this.id,
      parentStrategyId: this.parentStrategyId,
      period: this.period,
      repeating: this.repeating,
      startDate: this.startDate,
    }
  }

  restore(snapshot: DepositSnapshotIn) {
    const { parentStrategyId, accountId, amount, startDate, repeating, endDate, period } = snapshot

    this.accountId = accountId
    this.amount = amount
    this.endDate = endDate
    this.parentStrategyId = parentStrategyId
    this.period = period
    this.repeating = repeating
    this.startDate = startDate
  }

  get strategy() {
    return this.store.strategies.get(this.parentStrategyId)
  }

  get account() {
    return this.store.accounts.get(this.accountId)
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
}