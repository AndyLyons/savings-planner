import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import React from 'react'
import { addMonth, YYYYMM } from '../utils/date'
import { Account, AccountId } from './Account'
import { Collection } from './Collection'
import { Dialogs } from './Dialogs'
import { Menu } from './Menu'
import { Persistence } from './Persistence'
import { Person, PersonId } from './Person'
import { Strategy, StrategyId } from './Strategy'
import { migrate } from './versions/migrate'

export type StoreJSON = typeof Store.prototype.json

export class Store {
  static version = 2

  globalGrowth: number = 4
  showAges: boolean = true
  showIncomes: boolean = true
  showMonths: boolean = false
  start: YYYYMM
  end: YYYYMM
  retireOn: YYYYMM
  strategy: Strategy | null = null
  perspective: YYYYMM | null = null

  dialogs: Dialogs = new Dialogs(this)
  menu: Menu = new Menu(this)
  accounts: Collection<Account, AccountId> = new Collection({
    getId: account => account.id,
    fromJSON: (json, copy) => Account.fromJSON(this, json, copy),
    onDelete: account => {
      this.strategies.values.forEach(({ deposits, withdrawals }) => {
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
    }
  })

  people: Collection<Person, PersonId> = new Collection({
    getId: person => person.id,
    fromJSON: (json, copy) => Person.fromJSON(this, json, copy),
    onDelete: person => {
      person.accounts.forEach(account => this.accounts.remove(account))
    }
  })

  strategies: Collection<Strategy, StrategyId> = new Collection({
    getId: strategy => strategy.id,
    fromJSON: (json, copy) => Strategy.fromJSON(this, json, copy),
    onDelete: () => {}
  })

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })

    this.start = 202001 as YYYYMM
    this.end = 208712 as YYYYMM
    this.retireOn = 203704 as YYYYMM
  }

  get dates() {
    const dates: Array<YYYYMM> = []
    for (
      let date = this.showMonths ? this.start : addMonth(this.start, 11);
      date < this.end;
      date = addMonth(date, this.showMonths ? 1 : 12)
    ) {
      dates.push(date)
    }
    return dates
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

  toggleShowIncomes() {
    this.showIncomes = !this.showIncomes
  }

  toggleShowAges() {
    this.showAges = !this.showAges
  }

  toggleShowMonths() {
    this.showMonths = !this.showMonths
  }

  togglePerspective(date: YYYYMM) {
    this.perspective = this.perspective === date ? null : date
  }

  get json() {
    return {
      globalGrowth: this.globalGrowth,
      showIncomes: this.showIncomes,
      showAges: this.showAges,
      showMonths: this.showMonths,
      perspective: this.perspective,
      strategy: this.strategy?.id ?? null,
      people: this.people.toJSON(),
      accounts: this.accounts.toJSON(),
      strategies: this.strategies.toJSON(),
      version: Store.version
    }
  }

  toJSON() {
    return this.json
  }

  restore(json: StoreJSON, copy?: boolean) {
    const migrated = migrate(json)

    this.globalGrowth = migrated.globalGrowth
    this.showIncomes = migrated.showIncomes
    this.showAges = migrated.showAges
    this.showMonths = migrated.showMonths
    this.perspective = migrated.perspective

    this.people.restore(migrated.people, copy)
    this.accounts.restore(migrated.accounts, copy)
    this.strategies.restore(migrated.strategies, copy)

    this.strategy = migrated.strategy ? this.strategies.get(migrated.strategy) : null
  }
}

export const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)
