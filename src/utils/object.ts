export type ValueOf<T> = T[keyof T]
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

type ShallowPluck<T, K extends string> = K extends keyof T ? T[K] : undefined
type Pluck<T, Path extends string> = Path extends `${infer Key}.${infer Next}` ? Pluck<ShallowPluck<T, Key>, Next> : ShallowPluck<T, Path>

export function pluck<T, P extends string>(source: T, path: P): Pluck<T, P> {
  const paths = path.split('.')
  return paths.reduce((node: any, path) => {
    return node !== null && node !== undefined ? node[path] : undefined
  }, source) as unknown as Pluck<T, P>
}