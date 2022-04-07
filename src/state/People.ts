import { makeAutoObservable } from 'mobx'
import { keys } from '../utils/fn'
import type { PersonDetails, PersonId } from './Person'
import { Person } from './Person'
import type { Store } from './Store'

export type PeopleJSON = typeof People.prototype.json

export class People {
  store: Store

  data: Record<PersonId, Person> = {}

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  get values() {
    return Object.values(this.data)
  }

  addPerson(details: Omit<PersonDetails, 'id'>) {
    const person = Person.create(this.store, details)
    this.data[person.id] = person
  }

  clear() {
    keys(this.data).forEach(key => {
      delete this.data[key]
    })
  }

  getPerson(personId: PersonId): Person {
    return this.data[personId]
  }

  isPersonId(personId: string | undefined): personId is PersonId {
    return personId !== undefined && personId in this.data
  }

  removePerson(person: Person): void
  removePerson(personId: PersonId): void
  removePerson(personOrId: Person | PersonId) {
    const id = typeof personOrId === 'string' ? personOrId : personOrId.id
    delete this.data[id]
  }

  restoreSnapshot(snapshot: PeopleJSON) {
    this.clear()

    snapshot
      .map(person => Person.fromJSON(this.store, person))
      .forEach(this.addPerson)
  }

  get json() {
    return this.values.map(person => person.toJSON())
  }

  toJSON() {
    return this.json
  }
}