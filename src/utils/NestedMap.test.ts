import { describe, test, expect } from 'vitest'

import { NestedMap } from './NestedMap'

describe('NestedMap', () => {
  describe('size()', () => {
    test('should return 0 for an empty map', () => {
      const map = new NestedMap<[string, number], unknown>()

      expect(map.size).toBe(0)
    })

    test('should return the total number of values in nested maps', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')
      map.set(['foo', 2], 'baz')
      map.set(['bar', 1], 'qux')

      expect(map.size).toBe(3)
    })
  })

  describe('clear()', () => {
    test('should remove all values from the map', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')
      map.set(['foo', 2], 'baz')
      map.set(['bar', 1], 'qux')
      map.clear()

      expect(map.size).toBe(0)
    })
  })

  describe('has()', () => {
    test('should return true if the map has the specified key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.has(['foo', 1])).toBe(true)
    })

    test('should return true if the map has the specified key with undefined value', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], undefined)

      expect(map.has(['foo', 1])).toBe(true)
    })

    test('should return false if the map does not have the specified second level key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.has(['foo', 2])).toBe(false)
    })

    test('should return false if the map does not have the specified first level key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.has(['bar', 1])).toBe(false)
    })
  })

  describe('get()', () => {
    test('should return the value associated with the specified key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.get(['foo', 1])).toBe('bar')
    })

    test('should return undefined if the map does not have the specified second level key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.get(['foo', 2])).toBeUndefined()
    })

    test('should return undefined if the map does not have the specified first level key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.get(['bar', 1])).toBeUndefined()
    })
  })

  describe('set()', () => {
    test('should set the value associated with the specified key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.get(['foo', 1])).toBe('bar')
    })

    test('should override the value associated with an existing key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')
      map.set(['foo', 1], 'baz')

      expect(map.get(['foo', 1])).toBe('baz')
    })

    test('should set the value associated with the same second level key but different first level key', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')
      map.set(['bar', 1], 'qux')

      expect(map.get(['foo', 1])).toBe('bar')
      expect(map.get(['bar', 1])).toBe('qux')
    })
  })

  describe('delete()', () => {
    test('should return false if the specified key does not exist', () => {
      const map = new NestedMap<[string, number], unknown>()

      expect(map.delete(['foo', 1])).toBe(false)
    })

    test('should delete the given key if it exists', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')
      map.delete(['foo', 1])

      expect(map.has(['foo', 1])).toBe(false)
    })

    test('should return true if the given key exists', () => {
      const map = new NestedMap<[string, number], unknown>()
      map.set(['foo', 1], 'bar')

      expect(map.delete(['foo', 1])).toBe(true)
    })
  })
})