import { Person as MUIPersonIcon } from '@mui/icons-material'
import { addYears, differenceInYears } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { fromYYYY, toYYYY, YYYY } from '../utils/date'
import { extract } from '../utils/fn'
import type { Store } from './Store'

export type PersonId = string & { __personId__: never }

export type PersonJSON = typeof Person.prototype.json

export const PersonIcon = MUIPersonIcon

export class Person {
  store: Store

  id: PersonId
  name: string
  dob: YYYY

  constructor(
    store: Store,
    { id, name, dob }:
      Pick<Person, 'id' | 'name' | 'dob'>
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.dob = dob
  }

  static createId() {
    return nanoid(10) as PersonId
  }

  static fromJSON(store: Store, json: PersonJSON, copy?: boolean) {
    const { id, ...rest } = json

    return new Person(store, {
      id: copy ? Person.createId() : id,
      ...rest
    })
  }

  get accounts() {
    return this.store.accounts.values.filter(account => account.owner === this)
  }

  getAge = computedFn((date: YYYY) => {
    return differenceInYears(fromYYYY(date), this.dobAsDate)
  })

  getDateWhenAge = computedFn((age: number) => {
    return toYYYY(addYears(this.dobAsDate, age))
  })

  get dobAsDate() {
    return fromYYYY(this.dob)
  }

  restore(details: PersonJSON, copy?: boolean) {
    const { name, dob } = details

    this.name = name
    this.dob = dob
  }

  get json() {
    return extract(this, 'id', 'name', 'dob')
  }

  toJSON() {
    return this.json
  }
}