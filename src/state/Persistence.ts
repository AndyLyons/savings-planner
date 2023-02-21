import { IReactionDisposer, reaction } from 'mobx';
import { Store } from './Store';

export class Persistence {
  store: Store
  disposer: IReactionDisposer | null = null

  constructor(store: Store) {
    this.store = store
  }

  start() {
    const persisted = localStorage.getItem('store')

    try {

      if (persisted) {
        this.store.restore(JSON.parse(persisted), false)
      }

      this.disposer = reaction(
        () => JSON.stringify(this.store.toJSON()),
        (serialized) => localStorage.setItem('store', serialized),
        { fireImmediately: false })
    } catch(e) {
      alert('Could not restore snapshot - data is corrupted')
      console.error(e, persisted)
    }
  }

  stop() {
    if (this.disposer) {
      this.disposer()
      this.disposer = null
    }
  }
}