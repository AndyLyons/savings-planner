import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import React from 'react'
import { compareKeys } from '../utils/compare'
import { addMonth, getNow, YYYYMM } from '../utils/date'
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
  static version = 4

  globalGrowth: number = 2
  showAges: boolean = true
  showMonths: boolean = false
  start: YYYYMM
  end: YYYYMM
  retireOn: YYYYMM
  strategyId: StrategyId | null = null
  perspective: YYYYMM = getNow()
  showPerspective: boolean = false

  dialogs: Dialogs = new Dialogs(this)
  menu: Menu = new Menu(this)

  accounts: InstanceType<typeof Accounts>
  people: InstanceType<typeof People>
  strategies: InstanceType<typeof Strategies>

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })

    this.start = 202001 as YYYYMM
    this.end = 208712 as YYYYMM
    this.retireOn = 203704 as YYYYMM

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
    for (
      let date = this.showMonths ? this.start : addMonth(this.start, 11);
      date <= this.end;
      date = addMonth(date, this.showMonths ? 1 : 12)
    ) {
      dates.push(date)
    }
    return dates
  }

  get strategy() {
    return this.strategyId ? this.strategies.get(this.strategyId) : null
  }

  getDate = computedFn((index: number) => {
    return addMonth(this.start, index)
  })

  get globalRate() {
    return this.globalGrowth / 100
  }

  get globalRatePercentage() {
    return (this.globalRate * 100).toFixed(2).replace(/\.?0+$/, '')
  }

  toggleShowAges() {
    this.showAges = !this.showAges
  }

  toggleShowMonths() {
    this.showMonths = !this.showMonths
  }

  setPerspective(date: YYYYMM) {
    if (this.perspective === date) {
      this.togglePerspective()
    } else {
      this.perspective = date
      this.showPerspective = true
    }
  }

  togglePerspective() {
    this.showPerspective = !this.showPerspective
  }
}

export const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)
