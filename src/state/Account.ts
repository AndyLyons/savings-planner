import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { subYear, YYYY } from '../utils/date'
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
  balances: Collection<Balance, YYYY> = new Collection({
    getId: balance => balance.year,
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

  getStartingBalance(year: YYYY) {
    return this.getBalance(subYear(year)) + this.getDeposits(year)
  }

  getInterest = computedFn((year: YYYY): number => {
    return this.getStartingBalance(year) * this.aer
  })

  getDeposits = computedFn((year: YYYY): number => {
    return this.deposits.reduce((sum, deposit) => {
      const isSingleDeposit = !deposit.repeating && deposit.startYearValue === year
      const isRepeatingDeposit = deposit.repeating && deposit.endYearValue
        && deposit.startYearValue <= year && year < deposit.endYearValue

      return isSingleDeposit || isRepeatingDeposit ? sum + deposit.normalisedAmount : sum
    }, 0)
  })

  getWithdrawals = computedFn((year: YYYY): number => {
    const previousBalance = this.getStartingBalance(year)

    const withdrawals = this.withdrawals.reduce((sum, withdrawal) => {
      const isSingleWithdrawal = !withdrawal.repeating && withdrawal.startYearValue === year
      const isRepeatingWithdrawal = withdrawal.repeating && withdrawal.endYear
        && withdrawal.startYearValue <= year && year < withdrawal.endYear

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

  getBalance = computedFn((year: YYYY): number => {
    if (year < this.store.start) {
      return 0
    }

    if (this.balances.has(year)) {
      return this.balances.get(year).value
    }

    return this.getBalance(subYear(year))
      + this.getInterest(year)
      + this.getDeposits(year)
      - this.getWithdrawals(year)
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