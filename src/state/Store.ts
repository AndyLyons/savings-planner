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
  period: Period = Period.YEAR
  showAges: boolean = false
  showAccounts: boolean = true
  showHistory: boolean = true

  menu: Menu = new Menu(this)
  accounts: Accounts = new Accounts(this)
  balances: Balances = new Balances(this)
  people: People = new People(this)

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  toggleShowAges() {
    this.showAges = !this.showAges
  }

  toggleShowAccounts() {
    this.showAccounts = !this.showAccounts
  }

  toggleShowHistory() {
    this.showHistory = !this.showHistory
  }

  get json() {
    return {
      ...extract(
        this,
        'period',
        'showAges',
        'showAccounts',
        'showHistory'
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
    this.period = snapshot.period
    this.showAges = snapshot.showAges
    this.showAccounts = snapshot.showAccounts
    this.showHistory = snapshot.showHistory

    this.people.restoreSnapshot(snapshot.people)
    this.accounts.restoreSnapshot(snapshot.accounts)
    this.balances.restoreSnapshot(snapshot.balances)
  }
}

const store = new Store()
const persistence = new Persistence(store)
persistence.start()

export const StoreContext = React.createContext<Store>(store)