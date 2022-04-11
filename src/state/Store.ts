import { makeAutoObservable } from 'mobx'
import React from 'react'
import { extract } from '../utils/fn'
import { Accounts } from './Accounts'
import { Balances } from './Balances'
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

  menu: Menu = new Menu(this)
  accounts: Accounts = new Accounts(this)
  balances: Balances = new Balances(this)
  people: People = new People(this)

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get globalRate() {
    return this.globalGrowth / 100
  }

  get globalRatePercentage() {
    return (this.globalRate * 100).toFixed(2).replace(/\.?0+$/, '')
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
        'showAges'
      ),

      people: this.people.toJSON(),
      accounts: this.accounts.toJSON(),
      balances: this.balances.toJSON()
    }
  }

  toJSON() {
    return this.json
  }

  restoreSnapshot(snapshot: StoreJSON) {
    this.globalGrowth = snapshot.globalGrowth
    this.period = snapshot.period
    this.showAges = snapshot.showAges

    this.people.restoreSnapshot(snapshot.people)
    this.accounts.restoreSnapshot(snapshot.accounts)
    this.balances.restoreSnapshot(snapshot.balances)
  }
}

const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)