/* eslint-disable @typescript-eslint/no-unused-vars */
type Tail<T extends unknown[]> = T extends [infer _, ...infer R] ? R : never
type Last<T extends unknown[]> = T extends [...infer _, infer R] ? R : never
/* eslint-enable @typescript-eslint/no-unused-vars */

const NONE = Symbol('NONE')

class NestedMapInternal<K extends unknown[], V, L = Last<K>> {
  private map: Map<K[0], NestedMapInternal<Tail<K>, V, L> | V>

  constructor() {
    this.map = new Map()
  }

  get size(): number {
    let total = 0

    this.map.forEach((value) => {
      total += value instanceof NestedMapInternal ? value.size : 1
    })

    return total
  }

  clear(): void {
    this.map.forEach(value => {
      if (value instanceof NestedMapInternal) {
        value.clear()
      }
    })

    this.map.clear()
  }

  has(keys: K): boolean {
    return this._withNestedMap(keys, (map, key) => map.has(key), false)
  }

  get(keys: K): V | undefined {
    return this._withNestedMap(keys, (map, key) => map.get(key), undefined)
  }

  set(keys: K, value: V): void {
    this._withNestedMap(keys, (map, key) => map.set(key, value), NONE)
  }

  delete(keys: K): boolean {
    return this._withNestedMap(keys, (map, key) => map.delete(key), false)
  }

  private _withNestedMap<R>(keys: K, handler: (map: Map<L, V>, key: L) => R, notFoundValue: R | typeof NONE): R {
    if (keys.length === 0) {
      throw new Error('Keys array must not be empty')
    }

    const key = keys[0] as K[0]
    const nextKeys = keys.slice(1) as Tail<K>

    if (nextKeys.length === 0) {
      return handler(this.map as Map<L, V>, key as L)
    }

    let childMap = this.map.get(key)

    if (!this.map.has(key)) {
      // If NONE was provided then we want to create all the missing nodes down to the leaf,
      // otherwise we can shortcut return early when the value isn't found.
      if (notFoundValue !== NONE) {
        return notFoundValue as R
      }

      childMap = new NestedMapInternal<Tail<K>, V, L>()
      this.map.set(key, childMap)
    } else if (!(childMap instanceof NestedMapInternal)) {
      throw new Error('Cannot access a key on a value which is already a leaf node')
    }

    const result = childMap._withNestedMap(nextKeys, handler, notFoundValue)

    if (childMap.size === 0) {
      this.map.delete(key)
    }

    return result
  }
}

export class NestedMap<K extends unknown[], V> extends NestedMapInternal<K, V> {}