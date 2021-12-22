export function pipe<T>(...fns: Array<(param: T) => T>) {
    return (param: T) => fns.reduce((value, fn) => fn(value), param)
}

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