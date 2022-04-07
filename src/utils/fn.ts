export function extract<T, K extends Array<keyof T>>(source: T, ...keys: K) {
  const extracted = {} as Pick<T, K[number]>
  keys.forEach(key => {
    extracted[key] = source[key]
  })
  return extracted
}