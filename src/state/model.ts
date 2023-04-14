import { Store } from './Store'

type Constructor<P extends Array<any>, T> = new (...args: P) => T

const isModel = (thing: any): thing is Model<any, any> => thing instanceof Model

type Primitive = string | boolean | number | null | undefined

const isPrimitive = (value: any): value is Primitive => {
  const valueType = typeof value
  return valueType === 'string' || valueType === 'number' || valueType === 'boolean' || value == null
}

type SnapshotValue<T> =
  T extends Model<any, any> ? T['snapshot']
  : T extends Primitive ? T
  : never

type Snapshot<T, K extends keyof T> = {
  [P in K]: SnapshotValue<T[P]>
}

const getSnapshot = <T>(value: T): SnapshotValue<T> => {
  if (isModel(value)) {
    return value.snapshot as SnapshotValue<T>
  }

  if (isPrimitive(value)) {
    return value as SnapshotValue<T>
  }

  throw new Error(`Snapshot for value of type ${typeof value} unsupported`)
}

export const $snapshotKeys = Symbol('snapshotKeys')

export abstract class Model<T extends Model<any, any>, K extends Array<keyof T>> {
  store: Store
  [$snapshotKeys]: K

  constructor(store: Store, snapshotKeys: K) {
    this.store = store
    this[$snapshotKeys] = snapshotKeys
  }

  restore(snapshot: SnapshotValue<Pick<T, K[number]>>) {
    // TODO implement this
  }

  get snapshot(): Snapshot<T, K[number]> {
    const keys = this[$snapshotKeys]
    const snapshot = {} as Snapshot<T, K[number]>
    for(let key of keys) {
      const value = this[key as keyof this] as unknown as T[keyof T]
      snapshot[key] = getSnapshot(value)
    }
    return snapshot
  }
}

class Test extends Model<Test, ['thing']> {
  thing: string = ''
  other: number = 2

  constructor(store: Store) {
    super(store, ['thing'])
  }

  method() {
    const x = this.snapshot

  }
}

/**
 * Decorates an existing class with common model behaviour
 * @deprecated
 */
/*
export const createModel = <
  T extends Constructor<Array<any>, any>,
  K extends Array<keyof InstanceType<T>>
>(model: T, keys: K): Constructor<ConstructorParameters<T>, Model<InstanceType<T>, K[number]>> => {
  // Ideally I'd use inheritance, but MobX doesn't have great support for observables with
  // super/subclasses so we'll just add the relevant model methods to the existing prototype
  Object.assign(model.prototype, {
    toJSON() {
      const snapshot = {} as { [Key in K[number]]: SnapshotValue<InstanceType<T>[Key]> }
      for(let key of keys) {
        const value = (this as InstanceType<T>)[key]
        snapshot[key] = getSnapshot(value)
      }
      return snapshot
    }
  })

  return model as Constructor<ConstructorParameters<T>, Model<InstanceType<T>, K[number]>>
}
*/