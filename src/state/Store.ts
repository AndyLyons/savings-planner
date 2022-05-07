import { addYears, isBefore } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import React from 'react'
import { addYear, fromYYYY, toYYYY, YYYY } from '../utils/date'
import { extract } from '../utils/fn'
import { Account, AccountId } from './Account'
import { Collection } from './Collection'
import { Dialogs } from './Dialogs'
import { Menu } from './Menu'
import { Persistence } from './Persistence'
import { Person, PersonId } from './Person'
import { Strategy, StrategyId } from './Strategy'

export type StoreJSON = typeof Store.prototype.json

export class Store {
  globalGrowth: number = 4
  showAges: boolean = true
  showIncomes: boolean = true
  start: YYYY
  end: YYYY
  retireOn: YYYY
  strategy: Strategy | null = null

  dialogs: Dialogs = new Dialogs(this)
  menu: Menu = new Menu(this)
  accounts: Collection<Account, AccountId> = new Collection({
    getId: account => account.id,
    fromJSON: (json, copy) => Account.fromJSON(this, json, copy)
  })
  people: Collection<Person, PersonId> = new Collection({
    getId: person => person.id,
    fromJSON: (json, copy) => Person.fromJSON(this, json, copy)
  })
  strategies: Collection<Strategy, StrategyId> = new Collection({
    getId: strategy => strategy.id,
    fromJSON: (json, copy) => Strategy.fromJSON(this, json, copy)
  })

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })

    this.start = 2020 as YYYY
    this.end = 2087 as YYYY
    this.retireOn = 2037 as YYYY
  }

  get startYear() {
    return fromYYYY(this.start)
  }

  get endYear() {
    return fromYYYY(this.end)
  }

  get years() {
    const years = []
    for (let date = this.startYear; isBefore(date, this.endYear); date = addYears(date, 1)) {
      years.push(toYYYY(date))
    }
    return years
  }

  getDate = computedFn((index: number) => {
    return addYear(this.start, index)
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

  get json() {
    return {
      ...extract(
        this,
        'globalGrowth',
        'showIncomes',
        'showAges'
      ),

      strategy: this.strategy?.id ?? null,
      people: this.people.toJSON(),
      accounts: this.accounts.toJSON(),
      strategies: this.strategies.toJSON()
    }
  }

  toJSON() {
    return this.json
  }

  restore(json: StoreJSON, copy?: boolean) {
    this.globalGrowth = json.globalGrowth
    this.showIncomes = json.showIncomes
    this.showAges = json.showAges

    this.people.restore(json.people, copy)
    this.accounts.restore(json.accounts, copy)
    this.strategies.restore(json.strategies, copy)

    this.strategy = json.strategy ? this.strategies.get(json.strategy) : null
  }
}

export const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)