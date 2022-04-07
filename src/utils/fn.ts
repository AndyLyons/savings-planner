type Values<T> = T[keyof T]
export type KeyValues<T> = Values<{ [P in keyof T]: { key: P, value: T[P] } }>
export type KeyValuePairs<T> = Values<{ [P in keyof T]: [P, T[P]] }>

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