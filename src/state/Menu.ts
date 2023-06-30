import { makeAutoObservable } from 'mobx'
import type { Store } from './Store'

export class Menu {
  store: Store

  isOpen = false

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  closeMenu() {
    this.isOpen = false
  }

  toggle() {
    this.isOpen = !this.isOpen
  }
}