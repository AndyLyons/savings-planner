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

const TAX_BANDS = [
  { to: 12570, rate: 0 },
  { to: 50270, rate: 0.2 },
  { to: 100000, rate: 0.4 },
  // The 0.6 band accounts for the reduction in personal allowance at 100k
  { to: 125140, rate: 0.6 },
  { to: 150000, rate: 0.4 },
  { to: Infinity, rate: 0.45 }
]

const getTax = (taxable: number): number => {
  let alreadyTaxed = 0
  return TAX_BANDS.reduce((sum, { to, rate }) => {
    const taxableAtBand = Math.min(taxable, to)
    const untaxed = taxableAtBand - alreadyTaxed
    alreadyTaxed += untaxed
    return sum + (untaxed * rate)
  }, 0)
}

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

  getWithdrawals = (date: YYYYMM): number => {
    return this.accounts.map(account => account.getWithdrawalsTotal(date)).reduce((sum, value) => sum + value, 0)
  }

  getTax = (date: YYYYMM): number => {
    const taxableWithdrawals = this.accounts.flatMap(account => account.withdrawals.filter(withdrawal => withdrawal.taxable))
    const taxableWithdrawalsValue = taxableWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.getValue(date), 0)
    return getTax(taxableWithdrawalsValue)
  }

  getIncome = (date: YYYYMM) => {
    return this.getWithdrawals(date) - this.getTax(date)
  }
}