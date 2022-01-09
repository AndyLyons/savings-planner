import produce from 'immer'
import { State } from './app'

export const migrate: (state: any, version: number) => State = produce((state, version) => {
  if (version === 0) {
    /**
     * v0:
     *   - Changed the type of person IDs to be strings rather than number
     */
    state.peopleIds = state.peopleIds.map((numId: number) => `${numId}`)
    Object.keys(state.people).forEach(id => {
      state.people[id].id = `${state.people[id].id}`
    })
  }
})
