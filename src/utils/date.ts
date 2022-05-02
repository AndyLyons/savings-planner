import { format } from 'date-fns'

export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

// Represents a number guaranteed to be in the YYYY/YYYYMM format
export type YYYY = number & { __yyyy__: never }

export const isDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime())

export const addYear = (yyyy: YYYY, numYears = 1): YYYY => yyyy + numYears as YYYY
export const subYear = (yyyy: YYYY, numYears = 1): YYYY => yyyy - numYears as YYYY

export const toYYYY = (date: Date): YYYY => date.getFullYear() as YYYY
export const fromYYYY = (yyyy: YYYY): Date => {
  const date = new Date(0)
  date.setFullYear(yyyy)
  return date
}

export const formatDate = (date: Date): string => format(date, 'yyyy')