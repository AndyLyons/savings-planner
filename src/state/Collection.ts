import { makeAutoObservable } from 'mobx'
import { entries } from '../utils/object'

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
  data: Record<K, T> = {} as Record<K, T>
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
    const allEntries = entries(this.data)

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
    this.data[this.getId(item)] = item
    return item
  }

  create(json: J, copy?: boolean) {
    return this.add(this.fromJSON(json, copy))
  }

  clear() {
    this.keys.forEach(key => {
      delete this.data[key]
    })
  }

  get(id: K): T {
    return this.data[id]
  }

  has(id: string | number | undefined): id is K {
    return id !== undefined && id in this.data
  }

  remove(idOrItem: K | T) {
    const id = typeof idOrItem === 'string' || typeof idOrItem === 'number' ? idOrItem : this.getId(idOrItem as T)
    const item = this.data[id]
    this.onDelete(item)
    delete this.data[id]
    return item
  }

  restore(json: Array<J>, copy?: boolean) {
    const deleted = new Set(this.keys)

    json.forEach(itemJson => {
      const id = this.getId(itemJson)
      deleted.delete(id)

      if (this.has(id)) {
        this.data[id].restore(itemJson)
      } else {
        this.add(this.fromJSON(itemJson, copy))
      }
    })

    deleted.forEach(id => {
      delete this.data[id]
    })
  }

  get json() {
    return this.values.map(item => item.toJSON())
  }

  toJSON() {
    return this.json
  }
}