import { makeAutoObservable } from 'mobx'
import { keys, values } from '../utils/fn'

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

export class Collection<T extends Item<J>, K extends string, J extends JSON = GetJSON<T>> {
  data: Record<K, T> = {} as Record<K, T>
  getId: (item: T | J) => K
  fromJSON: (json: J, newIds?: boolean) => T

  constructor({ getId, fromJSON }: Pick<Collection<T, K, J>, 'getId' | 'fromJSON'>) {
    makeAutoObservable(this, { getId: false, fromJSON: false }, { autoBind: true })

    this.getId = getId
    this.fromJSON = fromJSON
  }

  get keys() {
    return keys(this.data)
  }

  get values() {
    return values(this.data)
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

  has(id: string | undefined): id is K {
    return id !== undefined && id in this.data
  }

  remove(idOrItem: K | T) {
    const id = typeof idOrItem === 'string' ? idOrItem : this.getId(idOrItem)
    const item = this.data[id]
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