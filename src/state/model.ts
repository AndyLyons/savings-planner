type Constructor<P extends Array<any>, T> = new (...args: P) => T

type JSONAble = {
  toJSON(): unknown
}

const hasToJSON = (value: any): value is JSONAble =>
  'toJSON' in value && typeof value.toJSON === 'function'

const isPrimitive = (value: any): value is string | boolean | number | null | undefined => {
  const valueType = typeof value
  return valueType === 'string' || valueType === 'number' || valueType === 'boolean' || value == null
}

export type Snapshot<T> =
  T extends JSONAble ? ReturnType<T['toJSON']>
    : T extends Array<infer E> ? Array<Snapshot<E>>
    : T extends object ? { [K in keyof T]: Snapshot<T[K]> }
    : T

const getSnapshot = <T>(value: T): Snapshot<T> => (
  hasToJSON(value) ? value.toJSON()
    : isPrimitive(value) ? value
      : Array.isArray(value) ? value.map(it => getSnapshot(it))
        : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, getSnapshot(entry)]))
) as Snapshot<T>

export interface Model<T, K extends keyof T> {
  restore(snapshot: Snapshot<Pick<T, K>>): void
  toJSON(): Snapshot<Pick<T, K>>
}

class Test implements Model<Test, 'thing'> {
  thing: string = ''

  restore(snapshot: { thing: string }): void {
    this.thing = snapshot.thing
  }

  toJSON() {
    return {
      thing: this.thing
    }
  }
}

/**
 * Decorates an existing class with common model behaviour
 */
export const createModel = <
  T extends Constructor<Array<any>, any>,
  K extends Array<keyof InstanceType<T>>
>(model: T, keys: K): Constructor<ConstructorParameters<T>, Model<InstanceType<T>, K[number]>> => {
  // Ideally I'd use inheritance, but MobX doesn't have great support for observables with
  // super/subclasses so we'll just add the relevant model methods to the existing prototype
  Object.assign(model.prototype, {
    toJSON() {
      const snapshot = {} as { [Key in K[number]]: Snapshot<InstanceType<T>[Key]> }
      for(let key of keys) {
        const value = (this as InstanceType<T>)[key]
        snapshot[key] = getSnapshot(value)
      }
      return snapshot
    }
  })

  return model as Constructor<ConstructorParameters<T>, Model<InstanceType<T>, K[number]>>
}