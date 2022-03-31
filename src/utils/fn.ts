export function removeArrayIndex<T>(arr: Array<T>, index: number) {
  if (index >= 0 && index < arr.length) {
    arr.splice(index, 1)
    return true
  }

  return false
}

export function removeArrayItem<T>(arr: Array<T>, item: T) {
  return removeArrayIndex(arr, arr.indexOf(item))
}

export function removeArrayFind<T>(arr: Array<T>, by: (value: T, index: number, arr: Array<T>) => boolean) {
  return removeArrayIndex(arr, arr.findIndex(by))
}

export function assign<T, S extends Partial<T>>(to: T, from: S) {
  Object.entries(from).forEach(([key, value]) => {
    to[key as keyof T] = value as T[keyof T]
  })
}

export function mapEntries<
  K_In extends string,
  K_Out extends string,
  V_In,
  V_Out
>(
  data: Record<K_In, V_In>,
  map: (key: K_In, value: V_In) => [K_Out, V_Out]
): Record<K_In, V_Out> {
  return Object.fromEntries(
    Object.entries(data).map(([id, value]) => map(id as K_In, value as V_In))
  ) as Record<K_In, V_Out>
}
