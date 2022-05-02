import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { subMonth, YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
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
  compoundPeriod: number
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

  // Annual Equivalence Rate
  get aer() {
    return Math.pow(1 + this.rate/this.compoundPeriod, this.compoundPeriod) - 1
  }

  // Monthly Equivalence Rate
  get mer() {
    return Math.pow(1 + this.aer, 1/12) - 1
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

  getPreviousBalance = computedFn((date: YYYYMM): number => {
    return date > this.store.start ? this.getBalance(subMonth(date)) : 0
  })

  getInterest = computedFn((date: YYYYMM): number => {
    return this.getPreviousBalance(date) * this.mer
  })

  getDeposits = computedFn((date: YYYYMM): number => {
    return this.deposits.reduce((sum, deposit) => {
      const isSingleDeposit = !deposit.repeating && deposit.startDate === date
      const isRepeatingDeposit = deposit.repeating && deposit.endDateValue
        && deposit.startDateValue <= date && date <= deposit.endDateValue

      return isSingleDeposit || isRepeatingDeposit ? sum + deposit.monthlyAmount : sum
    }, 0)
  })

  getWithdrawals = computedFn((date: YYYYMM): number => {
    const withdrawals = this.withdrawals.reduce((sum, withdrawal) => {
      const isSingleWithdrawal = !withdrawal.repeating && withdrawal.startDate === date
      const isRepeatingWithdrawal = withdrawal.repeating && withdrawal.endDate
        && withdrawal.startDateValue <= date && date <= withdrawal.endDate

      if (isSingleWithdrawal || isRepeatingWithdrawal) {
        const withdrawalAmount = withdrawal.type === WithdrawalType.FIXED
          ? withdrawal.monthlyAmount
          : this.getPreviousBalance(date) * withdrawal.monthlyAmount
        return sum + withdrawalAmount
      }

      return sum
    }, 0)

    const balanceWithInterest = this.getPreviousBalance(date) + this.getInterest(date)

    return withdrawals > balanceWithInterest ? balanceWithInterest : withdrawals
  })

  getBalance = computedFn((date: YYYYMM) => {
    if (this.balances.has(date)) {
      return this.balances.get(date).value
    }

    return this.getPreviousBalance(date)
      + this.getInterest(date)
      + this.getDeposits(date)
      - this.getWithdrawals(date)
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
      ...extract(this, 'id', 'name', 'growth', 'compoundPeriod'),
      owner: this.owner.id,
      balances: this.balances.toJSON()
    }
  }

  toJSON() {
    return this.json
  }
}