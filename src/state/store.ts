import { DependencyList, useCallback } from 'react'
import create, { EqualityChecker, State, StateCreator } from 'zustand'
import produce from 'immer'
import { pipe, removeArrayItem } from '../utils/fn'

function immerMiddleware<T extends State>(configure: StateCreator<T>): StateCreator<T> {
    return (set, get, api) => {
        const immerSet = (partial: any, replace?: boolean) => {
            const nextState = typeof partial === 'function'
                ? produce(partial)
                : partial
            return set(nextState, replace)
        }

        return configure(immerSet, get, api)
    }
}

const middleware = pipe(immerMiddleware)

type PersonId = number
interface Person {
    id: PersonId
    name: string
    dob: number
}

export interface AppState {
    peopleNextId: PersonId
    peopleIds: Array<PersonId>
    people: Partial<Record<PersonId, Person>>

    createPerson: () => PersonId
    removePerson: (id: PersonId) => void
    setPerson: <T extends keyof Person>(id: PersonId, field: T, value: Person[T]) => void
}

export const useStore = create<AppState>(
    middleware((set, get) => ({
        peopleNextId: 0,
        peopleIds: [],
        people: {},

        createPerson() {
            const id = get().peopleNextId

            set(state => {
                state.peopleIds.push(id)
                state.people[id] = { id, name: '', dob: -1 }
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
        setPerson(id, field, value) {
            set(state => {
                const person = state.people[id]
                if (person) {
                    person[field] = value
                }
            })
        }
    }))
)

export const useStoreProps = <T>(selector: (state: AppState) => T, deps: DependencyList, equalityFn?: EqualityChecker<T>) => useStore(useCallback(selector, deps), equalityFn)