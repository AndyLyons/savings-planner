import { Person as MUIPersonIcon } from '@mui/icons-material'
import { differenceInYears } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { fromYYYYMM, YYYYMM } from '../utils/date'
import type { Store } from './Store'

export type PersonId = string & { __personId__: never }

export type PersonJSON = typeof Person.prototype.json

export const PersonIcon = MUIPersonIcon

export class Person {
  store: Store

  id: PersonId
  name: string
  dob: YYYYMM

  constructor(
    store: Store,
    { id, name, dob }: Pick<Person, 'id' | 'name' | 'dob'>
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

  getAge = computedFn((date: YYYYMM) => {
    return differenceInYears(fromYYYYMM(date), this.dobAsDate)
  })

  get dobAsDate() {
    return fromYYYYMM(this.dob)
  }

  restore(details: PersonJSON, copy?: boolean) {
    const { name, dob } = details

    this.name = name
    this.dob = dob
  }

  get json() {
    return {
      id: this.id,
      name: this.name,
      dob: this.dob
    }
  }

  toJSON() {
    return this.json
  }
}