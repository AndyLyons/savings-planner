import { NestedMap } from "./NestedMap"
/*
export const computedAsyncFn = (getValue) => {
  const cache = new NestedMap()
  return (...params) => {
    if (cache.has(params)) {
      cache.get(params).current
    }

    const observableValue = observable({
      current: getValue(...params)
    })

    let disposer

    // API not quite right here, maybe use an atom?
    onBecomeObserved(observableValue, 'current', () => {
      disposer = reaction(
        () => {
          // will this run the first time and result in the value getting set twice?
          return getValue(...params)
        },
        valueOrPromise => {
          if (valueOrPromise instanceof Promise) {
            valuePromise.then((newValue) => {
              // Is this enough to trigger all the observers to
              observableValue.current = newValue
            }).catch(() => {
              // how to handle an error? Ignore?
              // Blank down? Maybe a config option for 'error value'
            })
          } else {
            observableValue.current = valueOrPromise
          }
        }
      )
    })

    onBecomeUnobserved(observableValue, 'current', () => {
      disposer()
      cache.delete(params)
    })

    return observableValue.current
  }
}
*/
export {}