import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { getMonth, Period, subMonth, YYYYMM } from '../utils/date'
import { Balance } from './Balance'
import { Collection } from './Collection'
import type { Person } from './Person'
import type { Store } from './Store'
import { WithdrawalType } from './Withdrawal'

export type AccountId = string & { __accountId__: never }

export type AccountJSON = typeof Account.prototype.json

export const AccountIcon = AccountBalance

export class Account {
  store: Store
  balances: Collection<Balance, YYYYMM> = new Collection({
    getId: balance => balance.date,
    fromJSON: json => Balance.fromJSON(this.store, this, json)
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

  get rate() {
    return this.growth === null ? this.store.globalRate : this.growth / 100
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

  getStartingBalance(date: YYYYMM) {
    return this.getBalance(subMonth(date)) + this.getDeposits(subMonth(date))
  }

  getInterest = computedFn((date: YYYYMM): number => {
    if (this.compoundPeriod === Period.YEAR && getMonth(date) !== 1) {
      return 0
    }

    const rate = this.compoundPeriod === Period.MONTH ? this.rate / 12 : this.rate
    return this.getStartingBalance(date) * rate
  })

  getDeposits = computedFn((date: YYYYMM): number => {
    return this.deposits.reduce((sum, deposit) => {
      const isSingleDeposit = !deposit.repeating && deposit.startDateValue === date
      const isRepeatingDeposit = deposit.repeating && deposit.endDateValue
        && deposit.startDateValue <= date && date < deposit.endDateValue

      return isSingleDeposit || isRepeatingDeposit ? sum + deposit.amount : sum
    }, 0)
  })

  getWithdrawals = computedFn((year: YYYYMM): number => {
    const previousBalance = this.getStartingBalance(year)

    const withdrawals = this.withdrawals.reduce((sum, withdrawal) => {
      const isSingleWithdrawal = !withdrawal.repeating && withdrawal.startYearValue === year
      const isRepeatingWithdrawal = withdrawal.repeating && withdrawal.endDate
        && withdrawal.startYearValue <= year && year <= withdrawal.endDate

      let withdrawalAmount = 0

      if (isSingleWithdrawal || isRepeatingWithdrawal) {
        if (withdrawal.type === WithdrawalType.PERCENTAGE) {
          withdrawalAmount = previousBalance * withdrawal.normalisedAmount
        } else if (withdrawal.type === WithdrawalType.STATIC_PERCENTAGE) {
          const staticBalance = this.getStartingBalance(withdrawal.startYearValue)
          withdrawalAmount = staticBalance * withdrawal.normalisedAmount
        } else {
          withdrawalAmount = withdrawal.normalisedAmount
        }
      }

      return sum + withdrawalAmount
    }, 0)

    const balanceWithInterest = previousBalance + this.getInterest(year)

    return withdrawals > balanceWithInterest ? balanceWithInterest : withdrawals
  })

  getCalculatedBalance = computedFn((date: YYYYMM): number => {
    if (date < this.store.start) {
      return 0
    }

    return this.getStartingBalance(date) + this.getInterest(date) - this.getWithdrawals(date)
  })

  getBalance = computedFn((date: YYYYMM): number => {
    if (this.balances.has(date)) {
      return this.balances.get(date).value
    }

    return this.getCalculatedBalance(date)
  })

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