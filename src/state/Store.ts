import { makeAutoObservable } from 'mobx'
import React from 'react'
import { compareKeys } from '../utils/compare'
import { getNow, asYear, YYYY, YYYYMM, getEndOfYear, addYear, getYear, asMonth, getYYYYMM } from '../utils/date'
import { Account, AccountId } from './Account'
import { configureCollection } from './Collection'
import { Dialogs } from './Dialogs'
import { Menu } from './Menu'
import { Persistence } from './Persistence'
import { Person, PersonId } from './Person'
import { Strategy, StrategyId } from './Strategy'
import { migrate } from './versions/migrate'

export type StoreSnapshotOut = typeof Store.prototype.snapshot
export type StoreSnapshotIn = StoreSnapshotOut

const Accounts = configureCollection<Account, AccountId>({
  getId: account => account.id,
  create: Account.create,
  onDelete: (store, account) => {
    store.strategies.values.forEach(({ deposits, withdrawals }) => {
      deposits.values.forEach(deposit => {
        if (deposit.account === account) {
          deposits.remove(deposit)
        }
      })

      withdrawals.values.forEach(withdrawal => {
        if (withdrawal.account === account) {
          withdrawals.remove(withdrawal)
        }
      })
    })
  },
  sort: compareKeys('owner.name', 'name')
})

const People = configureCollection<Person, PersonId>({
  getId: person => person.id,
  create: Person.create,
  onDelete: (store, person) => {
    person.accounts.forEach(account => store.accounts.remove(account))
  },
  sort: compareKeys('name')
})

const Strategies = configureCollection<Strategy, StrategyId>({
  getId: strategy => strategy.id,
  create: Strategy.create,
  sort: compareKeys('name')
})

export class Store {
  static version = 5

  globalGrowth = 2
  showAges = true
  expandedYear: YYYY | null = null
  start: YYYY
  end: YYYY
  retireOn: YYYY
  strategyId: StrategyId | null = null
  perspective: YYYYMM = getNow()
  showPerspective = false

  dialogs: Dialogs = new Dialogs(this)
  menu: Menu = new Menu(this)

  accounts: InstanceType<typeof Accounts>
  people: InstanceType<typeof People>
  strategies: InstanceType<typeof Strategies>

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })

    this.start = asYear(2020)
    this.end = asYear(2087)
    this.retireOn = asYear(2037)

    this.accounts = new Accounts(this)
    this.people = new People(this)
    this.strategies = new Strategies(this)
  }

  get snapshot() {
    return {
      globalGrowth: this.globalGrowth,
      strategyId: this.strategyId,
      people: this.people.snapshot,
      accounts: this.accounts.snapshot,
      strategies: this.strategies.snapshot,
      version: Store.version
    }
  }

  restore(snapshot: StoreSnapshotIn) {
    const migrated = migrate(snapshot)

    this.globalGrowth = migrated.globalGrowth
    this.strategyId = migrated.strategyId

    this.people.restore(migrated.people)
    this.accounts.restore(migrated.accounts)
    this.strategies.restore(migrated.strategies)
  }

  get dates() {
    const dates: Array<YYYYMM> = []
    for (let year = this.start; year <= this.end; year = addYear(year, 1)) {
      if (this.expandedYear === year) {
        for (let month = asMonth(1); month <= 12; ++month) {
          dates.push(getYYYYMM(year, month))
        }
      } else {
        dates.push(getEndOfYear(year))
      }
    }
    return dates
  }

  get strategy() {
    return this.strategyId ? this.strategies.get(this.strategyId) : null
  }

  get globalRate() {
    return this.globalGrowth / 100
  }

  get globalRatePercentage() {
    return (this.globalRate * 100).toFixed(2).replace(/\.?0+$/, '')
  }

  isDateInExpandedYear(date: YYYYMM) {
    return this.expandedYear !== null && getYear(date) === this.expandedYear
  }

  setPerspective(date: YYYYMM) {
    if (this.perspective === date) {
      this.togglePerspective()
    } else {
      this.perspective = date
      this.showPerspective = true
    }
  }

  toggleExpandedYear(year: YYYY) {
    this.expandedYear = this.expandedYear === year ? null : year
  }

  togglePerspective() {
    this.showPerspective = !this.showPerspective
  }

  toggleShowAges() {
    this.showAges = !this.showAges
  }
}

export const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)
