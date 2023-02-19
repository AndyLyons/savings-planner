import { AccountBalance } from '@mui/icons-material'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { lastTwelveMonths, getMonth, Period, subMonth, YYYYMM } from '../utils/date'
import { Balance } from './Balance'
import { Collection } from './Collection'
import { Deposit } from './Deposit'
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
    fromJSON: json => Balance.fromJSON(this.store, this, json),
    onDelete: () => {}
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

  getInterest = computedFn((date: YYYYMM): number => {
    if (this.compoundPeriod === Period.YEAR && getMonth(date) !== 12) {
      return 0
    }

    const rate = this.compoundPeriod === Period.MONTH ? this.rate / 12 : this.rate
    return this.getBalance(subMonth(date)) * rate
  })

  getDepositsForDate = computedFn((date: YYYYMM): Array<Deposit> =>
    this.deposits.filter(deposit => {
      const isSingleDeposit = !deposit.repeating && deposit.startDateValue === date
      const isRepeatingDeposit = deposit.repeating && deposit.endDateValue
        && deposit.startDateValue <= date && date < deposit.endDateValue

      return isSingleDeposit || isRepeatingDeposit
    })
  )

  getDeposits = computedFn((date: YYYYMM): number =>
    this.getDepositsForDate(date).reduce((sum, deposit) => sum + deposit.monthlyAmount, 0)
  )

  getWithdrawalsForDate = computedFn((date: YYYYMM) =>
    this.withdrawals.filter(withdrawal => {
      const isSingleWithdrawal = !withdrawal.repeating && withdrawal.startDateValue === date
      const isRepeatingWithdrawal = withdrawal.repeating && withdrawal.endDate
        && withdrawal.startDateValue <= date && date < withdrawal.endDate

      return isSingleWithdrawal || isRepeatingWithdrawal
    })
  )

  getWithdrawals = computedFn((date: YYYYMM): number => {
    const previousBalance = this.getBalance(subMonth(date))

    const withdrawals = this.getWithdrawalsForDate(date).reduce((sum, withdrawal) => {
      let withdrawalAmount = 0

      if (withdrawal.type === WithdrawalType.PERCENTAGE) {
        if (getMonth(date) === getMonth(withdrawal.startDateValue)) {
          withdrawalAmount = previousBalance * withdrawal.amountValue / 100
        }
      } else if (withdrawal.type === WithdrawalType.STATIC_PERCENTAGE) {
        if (getMonth(date) === getMonth(withdrawal.startDateValue)) {
          const staticBalance = this.getBalance(subMonth(withdrawal.startDateValue))
          withdrawalAmount = staticBalance * withdrawal.amountValue / 100
        }
      } else if (withdrawal.type === WithdrawalType.TAKE_INTEREST) {
        if (getMonth(date) === 12) {
          withdrawalAmount = previousBalance * withdrawal.amountValue / 100
        }
      } else if (withdrawal.type === WithdrawalType.FIXED_PER_YEAR) {
        withdrawalAmount = withdrawal.amountValue / 12
      } else {
        withdrawalAmount = withdrawal.amountValue
      }

      return sum + withdrawalAmount
    }, 0)

    const balanceBeforeWithdrawal = previousBalance + this.getInterest(date) + this.getDeposits(date)

    return withdrawals > balanceBeforeWithdrawal ? balanceBeforeWithdrawal : withdrawals
  })

  getYearInterest = computedFn((date: YYYYMM): number => {
    return lastTwelveMonths(date).reduce((sum, nextDate) => sum + this.getInterest(nextDate), 0)
  })

  getYearDeposits = computedFn((date: YYYYMM): number => {
    return lastTwelveMonths(date).reduce((sum, nextDate) => sum + this.getDeposits(nextDate), 0)
  })

  getYearWithdrawals = computedFn((date: YYYYMM): number => {
    return lastTwelveMonths(date).reduce((sum, nextDate) => sum + this.getWithdrawals(nextDate), 0)
  })

  getCalculatedBalance = computedFn((date: YYYYMM): number => {
    if (date < this.store.start) {
      return 0
    }

    return this.getBalance(subMonth(date)) + this.getInterest(date) + this.getDeposits(date) - this.getWithdrawals(date)
  })

  hasBalance = computedFn((date: YYYYMM): boolean => {
    const inPerspective = !this.store.perspective || date <= this.store.perspective
    return inPerspective && this.balances.has(date)
  })

  getBalance = computedFn((date: YYYYMM): number => {
    if (this.hasBalance(date)) {
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