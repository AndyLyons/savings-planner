import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Person } from './Person'
import type { Store } from './Store'

export type AccountId = string & { __accountId__: never }

export type AccountDetails = {
  id: AccountId
  name: string
  growth: number | null
  compoundPeriod: number
  owner: Person
}

export type AccountJSON = typeof Account.prototype.json

export class Account {
  store: Store

  id: AccountDetails['id']
  name: AccountDetails['name']
  growth: AccountDetails['growth']
  owner: AccountDetails['owner']
  compoundPeriod: AccountDetails['compoundPeriod']

  constructor(store: Store, { id, name, growth, owner, compoundPeriod }: AccountDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.growth = growth
    this.compoundPeriod = compoundPeriod
    this.owner = owner
  }

  static create(store: Store, details: Omit<AccountDetails, 'id'>) {
    return new Account(store, {
      id: nanoid(10) as AccountId,
      ...details
    })
  }

  static fromJSON(store: Store, json: AccountJSON) {
    const owner = store.people.getPerson(json.owner)
    return new Account(store, { ...json, owner })
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

  // Monthly Equivalence Rate
  get mer() {
    return Math.pow(1 + this.aer, 1/12) - 1
  }

  get balances() {
    return this.store.balances.values.filter(balance => balance.account === this)
  }

  balanceAtDate = computedFn((date: YYYYMM) =>
    this.balances.find(balance => balance.date === date)
  )

  get json() {
    return {
      ...extract(this, 'id', 'name', 'growth', 'compoundPeriod'),
      owner: this.owner.id
    }
  }

  toJSON() {
    return this.json
  }
}