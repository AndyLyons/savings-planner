import { DependencyList, useCallback } from 'react'
import { nanoid } from 'nanoid'
import create, { EqualityChecker } from 'zustand'
import { persist } from 'zustand/middleware'
import { YYYYMMDD } from '../utils/date'
import { removeArrayItem } from '../utils/fn'
import { useBind } from '../utils/hooks'
import { immer } from './middleware'
import { migrate } from './migrate'

export type PersonId = string & { __personId__: never }

export interface Person {
    id: PersonId
    name: string
    dob: YYYYMMDD
}

export type PersonDetails = Omit<Person, 'id'>

export interface State {
    peopleIds: Array<PersonId>
    people: Record<PersonId, Person>

    createPerson: (details: PersonDetails) => PersonId
    removePerson: (id: PersonId) => void
    editPerson: (id: PersonId, details: Partial<PersonDetails>) => void
}

export const useApp = create<State>(
  persist(
    immer((set, get) => ({
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
        set((state) => {
          state.people[id] = {
            ...state.people[id],
            ...details
          }
        })
      }
    })),
    {
      name: 'app-storage',
      version: 2,
      migrate
    }
  )
)

export const useSelector = <T>(
  selector: (state: State) => T,
  deps: DependencyList = [],
  equalityFn?: EqualityChecker<T>
) => useApp(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(selector, deps),
    equalityFn
  )

export const useAction = <
    Deps extends readonly any[],
    Params extends readonly any[],
    R
>(
    actionSelector: (state: State) => (...params: [...Deps, ...Params]) => R,
    ...deps: Deps
  ) => useBind(
    useSelector(actionSelector),
    ...deps
  )

export const useIsPersonId = (
  personId?: string
): personId is PersonId =>
  useSelector(
    state => Boolean(personId && Object.prototype.hasOwnProperty.call(state.people, personId)),
    [personId]
  )