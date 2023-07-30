import {
    observable,
    autorun,
    onBecomeUnobserved,
    action,
    computed,
    getDependencyTree,
    IComputedValue
} from 'mobx'
import { fromPromise } from 'mobx-utils';
import { beforeEach, describe, expect, test, vi } from "vitest"

type Fn<P extends Array<unknown>, R> = (...params: P) => R

function computedAsync<P extends Array<unknown>, R>(computeFn: Fn<P, Promise<R>>, initial: R): Fn<P, R> {
  const cache = new Map<string, IComputedValue<R>>();

  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      console.log('\tcache miss')
      const c = computed(() => {
        const result = fromPromise(computeFn(...args))
        console.log('\trunning compute', result.state, result.value)
        return result.state === 'fulfilled' ? result.value : initial
      });

      cache.set(key, c);

      onBecomeUnobserved(c, () => {
        console.log('\tunobserved')
        cache.delete(key)
      });
    }
    return cache.get(key)!.get();
  };
}

describe('computedAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  test('it works', () => {
    console.log('start')
    const fn = computedAsync(() => Promise.resolve(1), 0)
    console.log('created')
    
    console.log('calling first...')
    expect(fn()).toBe(0)
    console.log('called first')
    
    console.log('advance time...')
    vi.advanceTimersByTime(1)
    console.log('advanced time')
    
    console.log('calling second...')
    expect(fn()).toBe(1)
    console.log('called second')
  })
})

/*


test("basics - auto suspend", () => {
    const events: string[] = []
    const s = new Store(events)

    onBecomeUnobserved(s.persons, () => {
        events.push("unobserved persons")
    })

    s.filter = computedAsync(s.filterImp, [])

    expect(s.filter(20, "")).toEqual([jane])
    expect(s.filter(1, "j")).toEqual([john, jane])
    expect(s.filter(20, "")).toEqual([jane])

    expect(events.splice(0)).toEqual([
        "f 20 ",
        "f 1 j",
        "f 20 ", //suspended
    ])

    const d = autorun(() => {
        events.push(
            s
                .filter(1, "j")
                .map((p) => p.name)
                .join("-")
        )
    })

    s.persons[2].name = "jable"
    s.persons[1].name = "ane"

    s.persons[2].age = 0

    d()

    expect(s.filter(20, "")).toEqual([{ name: "ane", age: 45 }])
    expect(s.filter(20, "")).toEqual([{ name: "ane", age: 45 }])

    expect(events.splice(0)).toEqual([
        "f 1 j", // was suspended
        "john-jane",
        "f 1 j",
        "john-jane-jable",
        "f 1 j",
        "john-jable",
        "f 1 j",
        "john",
        "unobserved persons", // all suspended!
        "f 20 ",
        "f 20 ",
    ])
})

test("make sure the fn is cached", () => {
    const events: string[] = []

    const store = observable({
        a: 1,
        b: 2,
        c: 3,
        m: computedAsync(function m(this: any, x: any) {
            expect(this).toBe(store)
            events.push("calc " + x)
            return Promise.resolve(this.a * this.b * x)
        }, 0),
    })

    const d = autorun(() => {
        events.push("autorun " + store.m(3) * store.c)
    })

    expect(getDependencyTree(d)).toMatchSnapshot()

    store.b = 3
    store.c = 4

    expect(events).toEqual(["calc 3", "autorun 18", "calc 3", "autorun 27", "autorun 36"])
})

/*
test("supports options", () => {
    const events: number[][] = []
    const xs = observable([1, 2, 3])
    const xsLessThan = computedFn((n) => xs.filter((x) => x < n), { equals: comparer.structural })

    autorun(() => events.push(xsLessThan(3)))
    expect(events).toEqual([[1, 2]])

    events.length = 0
    xs.push(4)
    expect(events).toEqual([])
})
*/

/*
test("supports onCleanup", () => {
    const sep = observable.box(".")
    const unloaded: unknown[] = []
    const joinedStr = computedFn((sep) => [1, 2, 3].join(sep), {
        onCleanup: (result, sep) => unloaded.push([result, sep]),
    })
    autorun(() => joinedStr(sep.get()))
    sep.set(",")
    expect(unloaded.length).toBe(1)
    sep.set(" ")
    expect(unloaded).toEqual([
        ["1.2.3", "."],
        ["1,2,3", ","],
    ])
})
*/
/*
test("should not allow actions", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => computedAsync(action(() => Promise.resolve()), null)).toThrow()
})
*/