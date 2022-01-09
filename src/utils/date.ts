import { format, parse } from 'date-fns'

// Represents a string guaranteed to be in the YYYYMMDD format
export type YYYYMMDD = string & { __ymd__: never }

export const isDate = (date: Date | null | undefined): date is Date => date instanceof Date && !Number.isNaN(date.getTime())

export const toYYYYMMDD = (date: Date): YYYYMMDD => format(date, 'yyyyMMdd') as String as YYYYMMDD

export const fromYYYYMMDD = (date: YYYYMMDD): Date => parse(date.toString(), 'yyyyMMdd', new Date())

export const formatDate = (date: Date) => format(date, 'dd/MM/yyyy')

export const formatYYYYMMDD = (date: YYYYMMDD) => formatDate(fromYYYYMMDD(date))