import { addYears, format, parse, subYears } from 'date-fns'

export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

// Represents a string guaranteed to be in the YYYY/YYYYMM format
export type YYYY = string & { __yyyy__: never }

const ZERO_DATE = new Date(0) // date initialized to all zeroes

export const isDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime())

export const addYear = (date: YYYY, numYears = 1): YYYY =>
  toYYYY(addYears(fromYYYY(date), numYears))

export const subYear = (date: YYYY, numYears = 1): YYYY =>
  toYYYY(subYears(fromYYYY(date), numYears))

export const toYYYY = (date: Date): YYYY => format(date, 'yyyy') as YYYY
export const fromYYYY = (date: YYYY): Date => parse(date, 'yyyy', ZERO_DATE)

export const formatDate = (date: Date): string => format(date, 'yyyy')