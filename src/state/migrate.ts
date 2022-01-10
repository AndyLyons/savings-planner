import produce from 'immer'
import { nanoid } from 'nanoid'
import { State } from './app'

const MIGRATIONS = [
  /**
   * v0 => v1
   *   - Changed the type of person IDs to be strings rather than number
   */
  (state: any) => {
    state.peopleIds.forEach((numId: number, index: number) => {
      state.peopleIds[index] = `${numId}`
      state.people[numId].id = `${numId}`
    })
  },

  /**
   * v1 => v2
   *   - Removed peopleNextId, IDs now generated using nanoid
   */
  (state: any) => {
    delete state.peopleNextId
    state.peopleIds.forEach((id: string, index: number) => {
      const newId = nanoid(10)
      state.peopleIds[index] = newId
      state.people[newId] = state.people[id]
      state.people[newId].id = newId
      delete state.people[id]
    })
  },

  /**
   * v2 => v3
   *   - Removed id property from people state objects
   *   - Renamed peopleIds to personIds for consistency
   */
  (state: any) => {
    state.peopleIds.forEach((id: string) => {
      delete state.people[id].id
    })

    state.personIds = state.peopleIds
    delete state.peopleIds
  }
]

export const migrate: (state: any, version: number) => State = produce((state, version) => {
  for (let nextVersion = version; nextVersion < MIGRATIONS.length; nextVersion += 1) {
    MIGRATIONS[nextVersion](state)
  }
})
