import { pluck } from './object'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const compare = (a: any, b: any): number => {
  if (a < b) {
    return -1
  }

  if (b < a) {
    return 1
  }

  return 0
}

export const compareKeys = <T, Path extends Array<string>>(...paths: Path) => (a: T, b: T) => {
  for (const path of paths) {
    const compared = compare(pluck(a, path), pluck(b, path))
    if (compared !== 0) return compared
  }

  return 0
}