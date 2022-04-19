import { addMonths, isBefore } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import React from 'react'
import { addMonth, fromYYYYMM, subMonth, toYYYYMM, YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import { Accounts } from './Accounts'
import { Menu } from './Menu'
import { People } from './People'
import { Persistence } from './Persistence'

export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

export type StoreJSON = typeof Store.prototype.json

export class Store {
  globalGrowth: number = 4
  period: Period = Period.YEAR
  showAges: boolean = false
  showAccounts: boolean = false
  start: YYYYMM
  end: YYYYMM
  retireOn: YYYYMM

  menu: Menu = new Menu(this)
  accounts: Accounts = new Accounts(this)
  people: People = new People(this)

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

      people: this.people.toJSON(),
      accounts: this.accounts.toJSON(),
    }
  }

  toJSON() {
    return this.json
  }

  restoreSnapshot(snapshot: StoreJSON) {
    this.globalGrowth = snapshot.globalGrowth
    this.period = snapshot.period
    this.showAccounts = snapshot.showAccounts
    this.showAges = snapshot.showAges
    this.start = snapshot.start
    this.end = snapshot.end

    this.people.restoreSnapshot(snapshot.people)
    this.accounts.restoreSnapshot(snapshot.accounts)
  }
}

const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)