import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { State, useSelector } from '../app'
import { YYYYMMDD } from '../../utils/date'
import { removeArrayItem, assign } from '../../utils/fn'

export type PersonId = string & { __personId__: never }

export interface Person {
  name: string
  dob: YYYYMMDD
}

export interface PeopleState {
  personIds: Array<PersonId>
  people: Record<PersonId, Person>

  createPerson: (details: Person) => PersonId
  removePerson: (id: PersonId) => void
  editPerson: (id: PersonId, details: Partial<Person>) => void
}

export const useIsPersonId = (
  personId?: string
): personId is PersonId =>
  useSelector(
    state => Boolean(personId && Object.prototype.hasOwnProperty.call(state.people, personId)),
    [personId]
  )

export function createPeopleSlice(set: SetState<State>, get: GetState<State>): PeopleState {
  return ({
    personIds: [],
    people: {},

    createPerson(details) {
      const id = nanoid(10) as PersonId

      set(state => {
        state.personIds.push(id)
        state.people[id] = { ...details }
      })

      return id
    },
    removePerson(id) {
      set(state => {
        removeArrayItem(state.personIds, id)
        delete state.people[id]
      })
    },
    editPerson(id, details) {
      set(state => {
        assign(state.people[id], details)
      })
    },
  })
}