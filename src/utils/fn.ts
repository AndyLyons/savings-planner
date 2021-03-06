export type Optional<T, K extends string | number | symbol> = { [P in keyof T]: P extends K ? T[P] | undefined : T[P] }
export type KeyValues<T> = { [P in keyof T]: { key: P, value: T[P] } }[keyof T]
export type KeyValuePairs<T> = { [P in keyof T]: [P, T[P]] }[keyof T]

export function extract<T, K extends Array<keyof T>>(source: T, ...keys: K) {
  const extracted = {} as Pick<T, K[number]>
  keys.forEach(key => {
    extracted[key] = source[key]
  })
  return extracted
}

export function entries<T>(source: T) {
  return Object.entries(source) as Array<KeyValuePairs<T>>
}

export function keys<T>(source: T) {
  return Object.keys(source) as Array<keyof T>
}

export function values<T>(source: T) {
  return Object.values(source) as Array<T[keyof T]>
}