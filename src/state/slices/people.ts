import { nanoid } from 'nanoid'
import { GetState, SetState } from 'zustand'
import { YYYYMMDD } from '../../utils/date'
import { assign, removeArrayItem } from '../../utils/fn'
import { State, useSelector } from '../app'

export type PersonId = string & { __personId__: never }

export type Person = {
  id: PersonId
  name: string
  dob: YYYYMMDD
}

export type PersonUpdate = Omit<Person, 'id'>

export type PeopleState = {
  peopleIds: Array<PersonId>
  people: Record<PersonId, Person>

  createPerson: (details: PersonUpdate) => PersonId
  removePerson: (id: PersonId) => void
  editPerson: (id: PersonId, details: Partial<PersonUpdate>) => void
}

export const isPersonId = (
  personId: string | undefined,
  people: PeopleState['people'],
): personId is PersonId =>
  Boolean(personId && personId in people)

export const useIsPersonId = (
  personId?: string
): personId is PersonId =>
  useSelector(
    state => isPersonId(personId, state.people),
    [personId]
  )

export function createPeopleSlice(set: SetState<State>, get: GetState<State>): PeopleState {
  return ({
    peopleIds: [],
    people: {},

    createPerson(details) {
      const id = nanoid(10) as PersonId

      set(state => {
        state.peopleIds.push(id)
        state.people[id] = { id, ...details }
      })

      return id
    },
    removePerson(id) {
      set(state => {
        removeArrayItem(state.peopleIds, id)
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