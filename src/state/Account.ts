import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { extract } from '../utils/fn'
import type { Person } from './Person'
import type { Store } from './Store'

export type AccountId = string & { __accountId__: never }

export type AccountDetails = {
  id: AccountId
  name: string
  growth: number
  owner: Person
}

export type AccountJSON = typeof Account.prototype.json

export class Account {
  store: Store

  id: AccountDetails['id']
  name: AccountDetails['name']
  growth: AccountDetails['growth']
  owner: AccountDetails['owner']

  constructor(store: Store, { id, name, growth, owner }: AccountDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.growth = growth
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

  get balances() {
    return this.store.balances.values.filter(balance => balance.account === this)
  }

  get json() {
    return {
      ...extract(this, 'id', 'name', 'growth'),
      owner: this.owner.id
    }
  }

  toJSON() {
    return this.json
  }
}