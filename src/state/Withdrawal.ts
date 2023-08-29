import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { nanoid } from 'nanoid';
import { getMonth, getYear, getEndOfYear, subMonth, YYYY, YYYYMM } from '../utils/date';
import { Optional } from '../utils/object';
import type { AccountId } from './Account';
import { Store } from './Store';
import type { StrategyId } from './Strategy';

export type WithdrawalId = string & { __withdrawalId__: never }

export enum WithdrawalType {
  FIXED_PER_YEAR = 'FIXED_PER_YEAR',
  FIXED_PER_MONTH = 'FIXED_PER_MONTH',
  PERCENTAGE = 'PERCENTAGE',
  STATIC_PERCENTAGE = 'STATIC_PERCENTAGE',
  TAKE_INTEREST = 'TAKE_INTEREST'
}

export const RETIREMENT = '__RETIREMENT__'

export type WithdrawalSnapshotOut = typeof Withdrawal.prototype.snapshot
export type WithdrawalSnapshotIn = Optional<WithdrawalSnapshotOut, 'id'>

export { WithdrawalIcon } from '../components/icons/WithdrawalIcon';

export class Withdrawal {
  store: Store

  id: WithdrawalId
  parentStrategyId: StrategyId
  accountId: AccountId
  amount: number | null
  type: WithdrawalType
  startDate: YYYY | typeof RETIREMENT
  repeating: boolean
  endDate: YYYY | null
  taxable: boolean

  constructor(
    store: Store,
    { id = Withdrawal.createId(), parentStrategyId, accountId, amount, type, startDate, repeating, endDate, taxable }: WithdrawalSnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.parentStrategyId = parentStrategyId
    this.accountId = accountId
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.taxable = taxable
  }

  static createId() {
    return nanoid(10) as WithdrawalId
  }

  static create(store: Store, snapshot: WithdrawalSnapshotIn) {
    return new Withdrawal(store, snapshot)
  }

  static getDescription({ type, amount }: Pick<WithdrawalSnapshotIn, 'type' | 'amount'>) {
    const amountText = amount ?? '<Growth>'

    switch (type) {
      case WithdrawalType.FIXED_PER_YEAR:
        return `£${amountText} / year`
      case WithdrawalType.FIXED_PER_MONTH:
        return `£${amountText} / month`
      case WithdrawalType.PERCENTAGE:
        return `${amountText}% / year`
      case WithdrawalType.STATIC_PERCENTAGE:
        return `${amountText}% of initial / year`
      case WithdrawalType.TAKE_INTEREST:
        return 'Take interest'
      default:
        return 'Unknown'
    }
  }

  get snapshot() {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      startDate: this.startDate,
      repeating: this.repeating,
      endDate: this.endDate,
      taxable: this.taxable,
      accountId: this.account.id,
      parentStrategyId: this.parentStrategyId
    }
  }

  restore(snapshot: WithdrawalSnapshotIn) {
    const { parentStrategyId, accountId, amount, type, startDate, repeating, endDate, taxable } = snapshot

    this.parentStrategyId = parentStrategyId
    this.accountId = accountId
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.taxable = taxable
  }

  get parentStrategy() {
    return this.store.strategies.get(this.parentStrategyId)
  }

  get account() {
    return this.store.accounts.get(this.accountId)
  }

  get startDateValue() {
    return this.startDate === RETIREMENT ? this.store.retireOn : this.startDate
  }

  get amountValue() {
    return this.amount === null ? this.store.globalGrowth : this.amount
  }

  get description() {
    return Withdrawal.getDescription(this)
  }

  isValidIn = computedFn((year: YYYY): boolean => {
    const isSingleWithdrawal = !this.repeating && this.startDateValue === year
    const isRepeatingWithdrawal = this.repeating && this.endDate !== null
      && this.startDateValue <= year && year <= this.endDate

    return isSingleWithdrawal || isRepeatingWithdrawal
  })

  isValidOn = computedFn((date: YYYYMM): boolean => {
    if (!this.isValidIn(getYear(date))) return false

    switch (this.type) {
      case WithdrawalType.FIXED_PER_MONTH:
        return true
      case WithdrawalType.FIXED_PER_YEAR:
      case WithdrawalType.PERCENTAGE:
      case WithdrawalType.STATIC_PERCENTAGE:
      case WithdrawalType.TAKE_INTEREST:
        return getMonth(date) === 12
      default:
        return false
    }
  })

  getValue = computedFn((date: YYYYMM) => {
    if (!this.isValidOn(date)) return 0

    const getBalanceBeforeWithdrawal = (target: YYYYMM) =>
      this.account.getBalance(subMonth(target)) + this.account.getInterestTotal(target) + this.account.getDepositsTotal(target)

    switch (this.type) {
      case WithdrawalType.PERCENTAGE:
        return getBalanceBeforeWithdrawal(date) * this.amountValue / 100
      case WithdrawalType.STATIC_PERCENTAGE:
        return getBalanceBeforeWithdrawal(getEndOfYear(this.startDateValue)) * this.amountValue / 100
      case WithdrawalType.TAKE_INTEREST:
        return this.account.getYearInterestTotal(getYear(date))
      case WithdrawalType.FIXED_PER_MONTH:
      case WithdrawalType.FIXED_PER_YEAR:
        return this.amountValue
      default:
        return 0
    }
  })
}