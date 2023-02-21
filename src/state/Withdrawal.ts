import { makeAutoObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { nanoid } from 'nanoid';
import { getMonth, getYear, subMonth, YYYY, YYYYMM } from '../utils/date';
import type { Account } from './Account';
import { Store } from './Store';
import { Strategy } from './Strategy';

export type WithdrawalId = string & { __withdrawalId__: never }

export enum WithdrawalType {
  FIXED_PER_YEAR = 'FIXED_PER_YEAR',
  FIXED_PER_MONTH = 'FIXED_PER_MONTH',
  PERCENTAGE = 'PERCENTAGE',
  STATIC_PERCENTAGE = 'STATIC_PERCENTAGE',
  TAKE_INTEREST = 'TAKE_INTEREST'
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
  taxable: boolean

  constructor(
    store: Store,
    strategy: Strategy,
    { id, account, amount, type, startDate, repeating, endDate, taxable }:
      Pick<Withdrawal, 'id' | 'account' | 'amount' | 'type' | 'startDate' | 'repeating' | 'endDate' | 'taxable'>
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
    this.taxable = taxable
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

  static getDescription({ type, amount }: Pick<WithdrawalJSON, 'type' | 'amount'>) {
    const amountText = amount ?? '<Growth>'

    switch(type) {
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

  get startDateValue() {
    return this.startDate === RETIREMENT ? this.store.retireOn : this.startDate
  }

  get amountValue() {
    return this.amount === null ? this.store.globalGrowth : this.amount
  }

  get description() {
    return Withdrawal.getDescription(this)
  }

  isValidOn = computedFn((date: YYYYMM) => {
    const isSingleWithdrawal = !this.repeating && this.startDateValue === date
    const isRepeatingWithdrawal = this.repeating && this.endDate
      && this.startDateValue <= date && date < this.endDate

    return isSingleWithdrawal || isRepeatingWithdrawal
  })

  isValidIn = computedFn((year: YYYY) => {
    const isSingleWithdrawal = !this.repeating && getYear(this.startDateValue) === year
    const isRepeatingWithdrawal = this.repeating && this.endDate
      && getYear(this.startDateValue) <= year && year <= getYear(subMonth(this.endDate))

    return isSingleWithdrawal || isRepeatingWithdrawal
  })

  getValue = computedFn((date: YYYYMM) => {
    if (!this.isValidOn(date)) return 0

    const previousBalance = this.account.getBalance(subMonth(date))

    if (this.type === WithdrawalType.PERCENTAGE) {
      const isWithdrawalMonth = getMonth(date) === getMonth(this.startDateValue)
      return isWithdrawalMonth ? previousBalance * this.amountValue / 100 : 0
    } else if (this.type === WithdrawalType.STATIC_PERCENTAGE) {
      const isWithdrawalMonth = getMonth(date) === getMonth(this.startDateValue)
      return isWithdrawalMonth ? this.account.getBalance(subMonth(this.startDateValue)) * this.amountValue / 100 : 0
    } else if (this.type === WithdrawalType.TAKE_INTEREST) {
      return this.account.getInterestTotal(date)
    } else if (this.type === WithdrawalType.FIXED_PER_YEAR) {
      return this.amountValue / 12
    } else if (this.type === WithdrawalType.FIXED_PER_MONTH) {
      return this.amountValue
    }

    return 0
  })

  restore(json: WithdrawalJSON, copy?: boolean) {
    const { account, amount, type, startDate, repeating, endDate, taxable } = json

    this.account = this.store.accounts.get(account)
    this.amount = amount
    this.type = type
    this.startDate = startDate
    this.repeating = repeating
    this.endDate = endDate
    this.taxable = taxable
  }

  get json() {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      startDate: this.startDate,
      repeating: this.repeating,
      endDate: this.endDate,
      taxable: this.taxable,
      account: this.account.id
    }
  }

  toJSON() {
    return this.json
  }
}