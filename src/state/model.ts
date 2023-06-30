import { nanoid } from 'nanoid'
import { Store } from './Store'

const isModel = (thing: any): thing is Model<any, any, any> => thing instanceof Model

type Primitive = string | boolean | number | null | undefined

const isPrimitive = (value: any): value is Primitive => {
  const valueType = typeof value
  return valueType === 'string' || valueType === 'number' || valueType === 'boolean' || value == null
}

type SnapshotValue<T> =
  T extends Model<any, any, any> ? T['snapshot']
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

export const $SnapshotKeys = Symbol('snapshotKeys')

/*
TODO
  - Add id property to every model
  - Support id in snapshots: snapshout out should always have the id, for restore id should only be optional
  - Static create method?
  - Constructor takes snapshot to auto populate/initialise keys, inits ID if not provided
*/
export abstract class Model<T extends Model<any, any, any>, Id extends string, K extends Array<keyof T>> {
  store: Store
  id: Id

  [$SnapshotKeys]: K

  constructor(store: Store, id: Id | undefined, snapshotKeys: K) {
    this.store = store
    this.id = id ?? nanoid(10) as Id
    this[$SnapshotKeys] = snapshotKeys
  }

  restore(snapshot: Snapshot<T, K[number]>) {
    const keys = this[$SnapshotKeys]
    for(let key of keys) {
      const model = this as unknown as T
      const current = model[key]
      const value = snapshot[key] as unknown as T[keyof T]

      if (isModel(current)) {
        current.restore(value)
      } else if (isPrimitive(current)) {
        model[key] = value
      } else {
        throw new Error(`Restoring snapshot to value of type ${typeof current} unsupported`)
      }
    }
  }

  get snapshot(): Snapshot<T, K[number]> {
    const keys = this[$SnapshotKeys]
    const snapshot = {} as Snapshot<T, K[number]>
    for(let key of keys) {
      const value = this[key as keyof this] as unknown as T[keyof T]
      snapshot[key] = getSnapshot(value)
    }
    return snapshot
  }
}

type TestId = string & { _testId_: never }

class Test extends Model<Test, TestId, ['thing']> {
  thing: string = ''
  other: number = 2

  constructor(store: Store) {
    super(store, undefined, ['thing'])
  }

  method() {
    const x = this.snapshot

    this.restore({ thing: 'hi' })
  }
}