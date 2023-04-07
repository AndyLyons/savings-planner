import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { datesInYear, getMonth, Period, subMonth, YYYYMM, YYYY } from '../utils/date'
import { Optional } from '../utils/object'
import { Balance, BalanceSnapshotIn } from './Balance'
import { configureCollection } from './Collection'
import { Deposit } from './Deposit'
import type { PersonId, PersonSnapshotOut } from './Person'
import type { Store } from './Store'

// TODO tax calculations are currently wrong, tax should be calculated at the person level across all of their accounts
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

export type AccountSnapshotOut = typeof Account.prototype.snapshot
export type AccountSnapshotIn = Optional<AccountSnapshotOut, 'id'>

export const AccountIcon = AccountBalance

const Balances = configureCollection<Balance, YYYYMM, BalanceSnapshotIn>({
  getId: balance => balance.date,
  create: Balance.create,
  sort: (a, b) => a.value - b.value
})

export class Account {
  store: Store
  balances: InstanceType<typeof Balances>

  id: AccountId
  name: string
  growth: number | null
  compoundPeriod: Period
  ownerId: PersonId

  constructor(
    store: Store,
    { id = Account.createId(), name, growth, ownerId, compoundPeriod, balances }: AccountSnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
    this.balances = new Balances(store, balances)

    this.id = id
    this.name = name
    this.growth = growth
    this.compoundPeriod = compoundPeriod
    this.ownerId = ownerId
  }

  static createId() {
    return nanoid(10) as AccountId
  }

  static create(store: Store, snapshot: AccountSnapshotIn) {
    return new Account(store, snapshot)
  }

  static getDescription({ name }: Pick<AccountSnapshotIn, 'name'>, { name: ownerName }: Pick<PersonSnapshotOut, 'name'>) {
    return `${name} (${ownerName})`
  }

  get snapshot() {
    return {
      id: this.id,
      name: this.name,
      growth: this.growth,
      compoundPeriod: this.compoundPeriod,
      ownerId: this.ownerId,
      balances: this.balances.snapshot
    }
  }

  restore(snapshot: AccountSnapshotIn) {
    const { name, growth, compoundPeriod, ownerId, balances } = snapshot

    this.name = name
    this.growth = growth
    this.compoundPeriod = compoundPeriod
    this.ownerId = ownerId

    this.balances.restore(balances)
  }


  get owner() {
    return this.store.people.get(this.ownerId)
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

  getDepositsForDate = computedFn((date: YYYYMM): Array<Deposit> => this.deposits.filter(deposit => deposit.isValidOn(date)))
  getDepositsForYear = computedFn((year: YYYY): Array<Deposit> => this.deposits.filter(deposit => deposit.isValidIn(year)))

  getWithdrawalsForDate = computedFn((date: YYYYMM) => this.withdrawals.filter(withdrawal => withdrawal.isValidOn(date)))
  getWithdrawalsForYear = computedFn((year: YYYY) => this.withdrawals.filter(withdrawal => withdrawal.isValidIn(year)))

  getInterestTotal = (date: YYYYMM): number => {
    if (this.compoundPeriod === Period.YEAR && getMonth(date) !== 12) return 0

    return this.getBalance(subMonth(date)) * this.monthlyRate
  }

  getDepositsTotal = (date: YYYYMM): number => {
    return this.deposits.reduce((sum, deposit) => sum + deposit.getValue(date), 0)
  }

  getWithdrawalsTotal = (date: YYYYMM): number => {
    const balanceBeforeWithdrawal = this.getBalance(subMonth(date)) + this.getInterestTotal(date) + this.getDepositsTotal(date)
    const withdrawals = this.withdrawals.reduce((sum, withdrawal) => sum + withdrawal.getValue(date), 0)
    return Math.min(withdrawals, balanceBeforeWithdrawal)
  }

  getTax = (date: YYYYMM): number => {
    const withdrawals = this.getWithdrawalsTotal(date)
    const taxFreeWithdrawals = this.withdrawals.reduce((sum, withdrawal) => !withdrawal.taxable ? sum + withdrawal.getValue(date) : sum, 0)
    return getTax(withdrawals - taxFreeWithdrawals)
  }

  getIncomeTotal = (date: YYYYMM): number => {
    const total = this.getWithdrawalsTotal(date)
    const tax = this.getTax(date)
    return total - tax
  }

  getYearInterestTotal = (year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getInterestTotal(date), 0)
  }

  getYearDepositsTotal = (year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getDepositsTotal(date), 0)
  }

  getYearWithdrawalsTotal = (year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getWithdrawalsTotal(date), 0)
  }

  getYearIncomeTotal = (year: YYYY): number => {
    return datesInYear(year).reduce((sum, date) => sum + this.getIncomeTotal(date), 0)
  }

  getCalculatedBalance = computedFn((date: YYYYMM): number => {
    if (date < this.store.start) return 0

    const total = this.getBalance(subMonth(date)) + this.getInterestTotal(date) + this.getDepositsTotal(date) - this.getWithdrawalsTotal(date)

    // Treat <1 as 0 to avoid having pennies left in an account due to rounding issues
    return total < 1 ? 0 : total
  }, true)

  hasBalance = (date: YYYYMM): boolean => {
    const inPerspective = !this.store.showPerspective || date <= this.store.perspective
    return (inPerspective || this.balances.last?.date === date) && this.balances.has(date)
  }

  getBalance = (date: YYYYMM): number => {
    if (this.hasBalance(date)) {
      return this.balances.get(date).value
    }

    return this.getCalculatedBalance(date)
  }
}


