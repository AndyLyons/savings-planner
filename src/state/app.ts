import { DependencyList, useCallback } from 'react'
import create, { EqualityChecker } from 'zustand'
import { persist } from 'zustand/middleware'
import { removeArrayItem } from '../utils/fn'
import { YYYYMMDD } from '../utils/date'
import { immer } from './middleware'
import { useBind } from '../utils/hooks'

export type PersonId = string
export interface Person {
    id: PersonId
    name: string
    dob: YYYYMMDD
}
export type PersonDetails = Omit<Person, 'id'>

export interface AppState {
    peopleNextId: number
    peopleIds: Array<PersonId>
    people: Record<PersonId, Person>

    createPerson: (details: PersonDetails) => PersonId
    removePerson: (id: PersonId) => void
    editPerson: (id: PersonId, details: Partial<PersonDetails>) => void
}

export const useApp = create<AppState>(
    persist(
        immer((set, get) => ({
            peopleNextId: 0,
            peopleIds: [],
            people: {},

            createPerson(details) {
                const id = `${get().peopleNextId}`

                set(state => {
                    state.peopleIds.push(id)
                    state.people[id] = { id, ...details }
                    state.peopleNextId += 1
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
            name: 'app-storage'
        }
    )
)

export const useSelector = <T>(
    selector: (state: AppState) => T,
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
    actionSelector: (state: AppState) => (...params: [...Deps, ...Params]) => R,
    ...deps: Deps
) => useBind(
    useSelector(actionSelector),
    ...deps
)
