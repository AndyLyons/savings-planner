import { addMonths, format, parse, subMonths } from 'date-fns'

// Represents a string guaranteed to be in the YYYYMMDD/YYYYMM format
export type YYYYMM = string & { __ym__: never }

const ZERO_DATE = new Date(0) // date initialized to all zeroes

export const isDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime())

export const addMonth = (date: YYYYMM, numMonths = 1): YYYYMM =>
  toYYYYMM(addMonths(fromYYYYMM(date), numMonths))

export const subMonth = (date: YYYYMM, numMonths = 1): YYYYMM =>
  toYYYYMM(subMonths(fromYYYYMM(date), numMonths))

export const toYYYYMM = (date: Date): YYYYMM => format(date, 'yyyyMM') as YYYYMM

export const fromYYYYMM = (date: YYYYMM): Date => parse(date, 'yyyyMM', ZERO_DATE)

export const formatDate = (date: Date): string => format(date, 'MMMM yyyy')

export const formatYYYYMM = (date: YYYYMM) => formatDate(fromYYYYMM(date))