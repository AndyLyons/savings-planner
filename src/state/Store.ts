import { addMonths, isBefore } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import React from 'react'
import { addMonth, fromYYYYMM, toYYYYMM, YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import { Account, AccountId } from './Account'
import { Collection } from './Collection'
import { Dialogs } from './Dialogs'
import { Menu } from './Menu'
import { Persistence } from './Persistence'
import { Person, PersonId } from './Person'
import { Strategy, StrategyId } from './Strategy'

export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

export type StoreJSON = typeof Store.prototype.json

export class Store {
  globalGrowth: number = 4
  period: Period = Period.YEAR
  showAges: boolean = true
  showAccounts: boolean = true
  start: YYYYMM
  end: YYYYMM
  retireOn: YYYYMM
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

    this.start = '202001' as YYYYMM
    this.end = addMonth(this.start, 12 * 50)
    this.retireOn = '203705' as YYYYMM
  }

  get startDate() {
    return fromYYYYMM(this.start)
  }

  get endDate() {
    return fromYYYYMM(this.end)
  }

  get dates() {
    const dates = []
    for (let date = this.startDate; isBefore(date, this.endDate); date = addMonths(date, this.period === Period.YEAR ? 12 : 1)) {
      dates.push(toYYYYMM(date))
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

  toggleShowAccounts() {
    this.showAccounts = !this.showAccounts
  }

  toggleShowAges() {
    this.showAges = !this.showAges
  }

  get json() {
    return {
      ...extract(
        this,
        'globalGrowth',
        'period',
        'showAccounts',
        'showAges',
        'start',
        'end'
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
    this.period = json.period
    this.showAccounts = json.showAccounts
    this.showAges = json.showAges
    this.start = json.start
    this.end = json.end

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