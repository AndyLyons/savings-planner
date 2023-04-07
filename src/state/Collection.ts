import { makeAutoObservable } from 'mobx'
import type { Store } from './Store'

export type Item<S_In, S_Out> = {
  restore: (snapshot: S_In) => void
  snapshot: S_Out
}

type GetSnapshotIn<T> = T extends { restore(snapshot: infer S ): void } ? S : never
type GetSnapshotOut<T> = T extends { snapshot: infer S } ? S : never

type CollectionConfig<T, K, S> = {
  create: (store: Store, snapshot: S) => T
  getId: (item: T) => K
  onDelete?: (store: Store, item: T) => void
  sort?: ((a: T, b: T) => number)
}

export const configureCollection = <
  T extends Item<S_In, S_Out>,
  K extends string | number,
  S_In = GetSnapshotIn<T>,
  S_Out = GetSnapshotOut<T>
>({ create, getId, onDelete, sort }: CollectionConfig<T, K, S_In>) =>
    class Collection {
      store: Store
      data: Map<K, T>

      constructor(store: Store, initialValues?: Array<S_In>) {
        makeAutoObservable(this, { store: false }, { autoBind: true })

        this.store = store
        this.data = new Map<K, T>(initialValues?.map(it => {
          const instance = create(store, it)
          return [getId(instance), instance]
        }))
      }

      get snapshot() {
        return this.values.map(item => item.snapshot)
      }

      restore(snapshot: Array<S_In>) {
        this.data.clear()

        snapshot.forEach(itemSnapshot => {
          this.add(create(this.store, itemSnapshot))
        })
      }

      get entries() {
        const allEntries = Array.from(this.data.entries())

        if (!sort) return allEntries

        return allEntries.sort(([, a], [, b]) => sort(a, b))
      }

      get keys() {
        return this.entries.map(([key]) => key)
      }

      get values() {
        return this.entries.map(([, value]) => value)
      }

      get first(): T | undefined {
        return this.values[0]
      }

      get last(): T | undefined {
        return this.values[this.values.length - 1]
      }

      add(item: T) {
        this.data.set(getId(item), item)
        return item
      }

      create(snapshot: S_In) {
        return this.add(create(this.store, snapshot))
      }

      get(id: K): T {
        const item = this.data.get(id)

        if (!item) throw new Error(`Id <${id}> does not exist in collection`)

        return item
      }

      has(id: string | number | undefined): id is K {
        return id !== undefined && this.data.has(id as K)
      }

      remove(idOrItem: K | T) {
        const id = typeof idOrItem === 'string' || typeof idOrItem === 'number' ? idOrItem : getId(idOrItem as T)
        const item = this.get(id)
        onDelete?.(this.store, item)
        this.data.delete(id)
        return item
      }
    }