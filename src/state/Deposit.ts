import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { nanoid } from 'nanoid';
import { getYear, YYYY, YYYYMM } from '../utils/date';
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
  endDate: YYYY | typeof RETIREMENT | null
  hidden: boolean
  id: DepositId
  parentStrategyId: StrategyId
  period: Period
  repeating: boolean
  startDate: YYYY | typeof START

  constructor(
    store: Store,
    { id = Deposit.createId(), accountId, amount, startDate, repeating, endDate, period, parentStrategyId, hidden }: DepositSnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.parentStrategyId = parentStrategyId
    this.accountId = accountId
    this.amount = amount
    this.hidden = hidden
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
      hidden: this.hidden,
      id: this.id,
      parentStrategyId: this.parentStrategyId,
      period: this.period,
      repeating: this.repeating,
      startDate: this.startDate,
    }
  }

  restore(snapshot: DepositSnapshotIn) {
    const { parentStrategyId, accountId, amount, startDate, repeating, endDate, period, hidden } = snapshot

    this.accountId = accountId
    this.amount = amount
    this.endDate = endDate
    this.hidden = hidden
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
    return this.endDate === RETIREMENT ? this.store.retireOn : this.endDate ?? this.store.end
  }

  get description() {
    return Deposit.getDescription(this)
  }

  toggleHidden = () => {
    this.hidden = !this.hidden
  }

  isValidIn = (year: YYYY): boolean => {
    const isSingleDeposit = !this.repeating && this.startDateValue === year
    const isRepeatingDeposit = this.repeating && this.startDateValue <= year && year <= this.endDateValue

    return isSingleDeposit || isRepeatingDeposit
  }

  isValidOn = (date: YYYYMM): boolean => {
    return this.isValidIn(getYear(date))
  }

  getValue = computedFn((date: YYYYMM) => {
    if (!this.isValidOn(date) || this.hidden) return 0

    return this.period === Period.YEAR ? this.amount / 12 : this.amount
  })
}