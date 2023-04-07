import { Person as MUIPersonIcon } from '@mui/icons-material'
import { differenceInYears } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nanoid } from 'nanoid'
import { fromYYYYMM, YYYYMM } from '../utils/date'
import { Optional } from '../utils/object'
import type { Store } from './Store'

export type PersonId = string & { __personId__: never }

export type PersonSnapshotOut = typeof Person.prototype.snapshot
export type PersonSnapshotIn = Optional<PersonSnapshotOut, 'id'>

export const PersonIcon = MUIPersonIcon

export class Person {
  store: Store

  id: PersonId
  name: string
  dob: YYYYMM

  constructor(
    store: Store,
    { id = Person.createId(), name, dob }: PersonSnapshotIn
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

  static create(store: Store, snapshot: PersonSnapshotIn) {
    return new Person(store, snapshot)
  }

  get snapshot() {
    return {
      id: this.id,
      name: this.name,
      dob: this.dob
    }
  }

  restore(details: PersonSnapshotIn) {
    const { name, dob } = details

    this.name = name
    this.dob = dob
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
}