import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { datesInYear, getMonth, Period, subMonth, YYYYMM, YYYY } from '../utils/date'
import { Balance } from './Balance'
import { Collection } from './Collection'
import { Deposit } from './Deposit'
import type { Person, PersonJSON } from './Person'
import type { Store } from './Store'

const TAX_BANDS = [
  { to: 12570, rate: 0 },
  { to: 50270, rate: 0.2 },
  { to: 100000, rate: 0.4 },
  // The 0.6 band accounts for the reduction in personal allowance at 100k
  { to: 125140, rate: 0.6 },
  { to: 150000, rate: 0.4 },
  { to: Infinity, rate: 0.45 }
]

const getTax = (taxable: number): number => {
  let alreadyTaxed = 0
  return TAX_BANDS.reduce((sum, { to, rate }) => {
    const taxableAtBand = Math.min(taxable, to)
    const untaxed = taxableAtBand - alreadyTaxed
    alreadyTaxed += untaxed
    return sum + (untaxed * rate)
  },  0)
}

export type AccountId = string & { __accountId__: never }

export type AccountJSON = typeof Account.prototype.json

export const AccountIcon = AccountBalance

export class Account {
  store: Store
  balances: Collection<Balance, YYYYMM> = new Collection({
    getId: balance => balance.date,
    fromJSON: json => Balance.fromJSON(this.store, this, json),
    onDelete: () => {},
    sort: (a, b) => a.value - b.value
  })

  id: AccountId
  name: string
  growth: number | null
  compoundPeriod: Period
  owner: Person

  constructor(
    store: Store,
    { id, name, growth, owner, compoundPeriod }:
      Pick<Account, 'id' | 'name' | 'growth' | 'owner' | 'compoundPeriod'>
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.growth = growth
    this.compoundPeriod = compoundPeriod
    this.owner = owner
  }

  static createId() {
    return nanoid(10) as AccountId
  }

  static fromJSON(store: Store, json: AccountJSON, copy?: boolean) {
    const { owner, balances, id, ...rest } = json
    const account = new Account(store, {
      ...rest,
      id: copy ? Account.createId() : id,
      owner: store.people.get(owner)
    })
    account.balances.restore(balances, copy)
    return account
  }

  static getDescription({ name }: Pick<AccountJSON, 'name'>, { name: ownerName }: Pick<PersonJSON, 'name'>) {
    return `${name} (${ownerName})`
  }

  get rate() {
    return this.growth === null ? this.store.globalRate : this.growth / 100
  }

  get monthlyRate() {
    return this.compoundPeriod === Period.MONTH ? this.rate / 12 : this.rate
  }

  get ratePercentage() {
    return (this.rate * 100).toFixed(2).replace(/\.?0+$/, '')
  }

  get deposits() {
    return this.store.strategy
      ? this.store.strategy.deposits.values.filter(deposit => deposit.account === this)
      : []
  }

  get withdrawals() {
    return this.store.strategy
      ? this.store.strategy.withdrawals.values.filter(withdrawal => withdrawal.account === this)
      : []
  }

  get description() {
    return Account.getDescription(this, this.owner)
  }

  getDepositsForDate = computedFn((date: YYYYMM): Array<Deposit> => this.deposits.filter(deposit => deposit.isValidOn(date)), true)
  getDepositsForYear = computedFn((year: YYYY): Array<Deposit> => this.deposits.filter(deposit => deposit.isValidIn(year)), true)

  getWithdrawalsForDate = computedFn((date: YYYYMM) => this.withdrawals.filter(withdrawal => withdrawal.isValidOn(date)), true)
  getWithdrawalsForYear = computedFn((year: YYYY) => this.withdrawals.filter(withdrawal => withdrawal.isValidIn(year)), true)

  getInterestTotal = computedFn((date: YYYYMM): number => {
    if (this.compoundPeriod === Period.YEAR && getMonth(date) !== 12) return 0

    return this.getBalance(subMonth(date)) * this.monthlyRate
  }, true)

  getDepositsTotal = computedFn((date: YYYYMM): number => {
    return this.deposits.reduce((sum, deposit) => sum + deposit.getValue(date), 0)
  }, true)

  getWithdrawalsTotal = computedFn((date: YYYYMM): number => {
    const balanceBeforeWithdrawal = this.getBalance(subMonth(date)) + this.getInterestTotal(date) + this.getDepositsTotal(date)
    const withdrawals = this.withdrawals.reduce((sum, withdrawal) => sum + withdrawal.getValue(date), 0)
    return Math.min(withdrawals, balanceBeforeWithdrawal)
  }, true)

  getTax = computedFn((date: YYYYMM): number => {
    const withdrawals = this.getWithdrawalsTotal(date)
    const taxFreeWithdrawals = this.withdrawals.reduce((sum, withdrawal) => !withdrawal.taxable ? sum + withdrawal.getValue(date) : sum, 0)
    return getTax(withdrawals - taxFreeWithdrawals)
  }, true)

  getIncomeTotal = computedFn((date: YYYYMM): number => {
    const total = this.getWithdrawalsTotal(date)
    const tax = this.getTax(date)
    return total - tax
  }, true)

  getYearInterestTotal = computedFn((year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getInterestTotal(date), 0)
  }, true)

  getYearDepositsTotal = computedFn((year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getDepositsTotal(date), 0)
  }, true)

  getYearWithdrawalsTotal = computedFn((year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getWithdrawalsTotal(date), 0)
  }, true)

  getYearIncomeTotal = computedFn((year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getIncomeTotal(date), 0)
  }, true)

  getCalculatedBalance = computedFn((date: YYYYMM): number => {
    if (date < this.store.start) return 0

    const total = this.getBalance(subMonth(date)) + this.getInterestTotal(date) + this.getDepositsTotal(date) - this.getWithdrawalsTotal(date)

    // Treat <1 as 0 to avoid having pennies left in an account due to rounding issues
    return total < 1 ? 0 : total
  }, true)

  hasBalance = computedFn((date: YYYYMM): boolean => {
    const inPerspective = !this.store.showPerspective || date <= this.store.perspective
    return (inPerspective || this.balances.last?.date === date) && this.balances.has(date)
  }, true)

  getBalance = computedFn((date: YYYYMM): number => {
    if (this.hasBalance(date)) {
      return this.balances.get(date).value
    }

    return this.getCalculatedBalance(date)
  }, true)

  restore(json: AccountJSON, copy?: boolean) {
    const { name, growth, compoundPeriod, owner: ownerId, balances } = json

    this.name = name
    this.growth = growth
    this.compoundPeriod = compoundPeriod
    this.owner = this.store.people.get(ownerId)

    this.balances.restore(balances, copy)
  }

  get json() {
    return {
      id: this.id,
      name: this.name,
      growth: this.growth,
      compoundPeriod: this.compoundPeriod,
      owner: this.owner.id,
      balances: this.balances.toJSON()
    }
  }

  toJSON() {
    return this.json
  }
}


