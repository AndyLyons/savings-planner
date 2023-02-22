import { makeAutoObservable } from 'mobx'

type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [x: string]: JSONValue }
  | Array<JSONValue>

type JSON = { [x: string]: JSONValue }

export type Item<J extends JSON> = {
  restore: (json: J) => void
  toJSON: () => J
}

type GetJSON<T> = T extends { toJSON: () => infer J } ? J : never

export class Collection<T extends Item<J>, K extends string | number, J extends JSON = GetJSON<T>> {
  data: Map<K, T> = new Map<K, T>()
  getId: (item: T | J) => K
  fromJSON: (json: J, newIds?: boolean) => T
  onDelete: (item: T) => void
  sort: ((a: T, b: T) => number) | null

  constructor({ getId, fromJSON, onDelete, sort }: Pick<Collection<T, K, J>, 'getId' | 'fromJSON' | 'onDelete' | 'sort'>) {
    makeAutoObservable(this, { getId: false, fromJSON: false, sort: false }, { autoBind: true })

    this.getId = getId
    this.fromJSON = fromJSON
    this.onDelete = onDelete
    this.sort = sort
  }

  get entries() {
    const allEntries = Array.from(this.data.entries())

    const sort = this.sort
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
    this.data.set(this.getId(item), item)
    return item
  }

  create(json: J, copy?: boolean) {
    return this.add(this.fromJSON(json, copy))
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
    const id = typeof idOrItem === 'string' || typeof idOrItem === 'number' ? idOrItem : this.getId(idOrItem as T)
    const item = this.get(id)
    this.onDelete(item)
    this.data.delete(id)
    return item
  }

  restore(json: Array<J>, copy?: boolean) {
    this.data.clear()

    json.forEach(itemJson => {
      this.add(this.fromJSON(itemJson, copy))
    })
  }

  get json() {
    return this.values.map(item => item.toJSON())
  }

  toJSON() {
    return this.json
  }
}