import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { YYYYMMDD } from '../utils/date'
import { extract } from '../utils/fn'
import { Store } from './Store'

export type PersonId = string & { __personId__: never }

export type PersonDetails = {
  id: PersonId
  name: string
  dob: YYYYMMDD
}

export type PersonJSON = typeof Person.prototype.json

export class Person {
  store: Store

  id: PersonId
  name: string
  dob: YYYYMMDD

  constructor(store: Store, { id, name, dob }: PersonDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.dob = dob
  }

  static create(store: Store, details: Omit<PersonDetails, 'id'>) {
    return new Person(store, {
      id: nanoid(10) as PersonId,
      ...details
    })
  }

  static fromJSON(store: Store, json: PersonJSON) {
    return new Person(store, json)
  }

  get accounts() {
    return this.store.accounts.values.filter(account => account.owner === this)
  }

  get json() {
    return extract(this, 'id', 'name', 'dob')
  }

  toJSON() {
    return this.json
  }
}