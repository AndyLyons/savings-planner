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

    if (persisted) {
      this.store.restoreSnapshot(JSON.parse(persisted))
    }

    this.disposer = reaction(
      () => JSON.stringify(this.store.toJSON()),
      (serialized) => localStorage.setItem('store', serialized),
      { fireImmediately: false })
  }

  stop() {
    if (this.disposer) {
      this.disposer()
      this.disposer = null
    }
  }
}