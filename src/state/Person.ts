import { addYears, differenceInYears } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { fromYYYYMM, toYYYYMM, YYYYMM } from '../utils/date'
import { extract } from '../utils/fn'
import type { Store } from './Store'

export type PersonId = string & { __personId__: never }

export type PersonDetails = {
  id: PersonId
  name: string
  dob: YYYYMM
}

export type PersonJSON = typeof Person.prototype.json

export class Person {
  store: Store

  id: PersonId
  name: string
  dob: YYYYMM

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

  getAge = computedFn((date: YYYYMM) => {
    return differenceInYears(fromYYYYMM(date), this.dobAsDate)
  })

  getDateWhenAge = computedFn((age: number) => {
    return toYYYYMM(addYears(this.dobAsDate, age))
  })

  get dobAsDate() {
    return fromYYYYMM(this.dob)
  }

  get json() {
    return extract(this, 'id', 'name', 'dob')
  }

  toJSON() {
    return this.json
  }
}