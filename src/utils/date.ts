import { format, parse } from 'date-fns'

// Represents a string guaranteed to be in the YYYYMMDD/YYYYMM format
export type YYYYMMDD = string & { __ymd__: never }
export type YYYYMM = string & { __ym__: never }

const ZERO_DATE = new Date(0) // date initialized to all zeroes

export const isDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime())

export const toYYYYMM = (date: Date): YYYYMM => format(date, 'yyyyMM') as YYYYMM

export const fromYYYYMM = (date: YYYYMM): Date => parse(date, 'yyyyMM', ZERO_DATE)

export const toYYYYMMDD = (date: Date): YYYYMMDD => format(date, 'yyyyMMdd') as YYYYMMDD

export const fromYYYYMMDD = (date: YYYYMMDD): Date => parse(date, 'yyyyMMdd', ZERO_DATE)

export const formatYYYYMMDD = (date: YYYYMMDD) => formatDate(fromYYYYMMDD(date))

export const formatDate = (date: Date): string => format(date, 'dd/MM/yyyy')