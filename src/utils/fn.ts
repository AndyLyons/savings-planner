export type KeyValues<T> = { [P in keyof T]: { key: P, value: T[P] } }[keyof T]
export type KeyValuePairs<T> = { [P in keyof T]: [P, T[P]] }[keyof T]

export function entries<T>(source: T) {
  return Object.entries(source) as Array<KeyValuePairs<T>>
}

export function keys<T>(source: T) {
  return Object.keys(source) as Array<keyof T>
}

export function values<T>(source: T) {
  return Object.values(source) as Array<T[keyof T]>
}