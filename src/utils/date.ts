export enum Period {
  MONTH = 'month',
  YEAR ='year'
}

// Represents a number representing a month/year
export type MM = number & { __mm__: never }
export type YYYY = number & { __yyyy__: never }
export type YYYYMM = number & { __yyyymm__: never }

export const isDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime())

export const addYear = (yyyy: YYYY, numYears = 1): YYYY => yyyy + numYears as YYYY
export const subYear = (yyyy: YYYY, numYears = 1): YYYY => addYear(yyyy, numYears * -1)

export const getYear = (yyyymm: YYYYMM): YYYY => Math.trunc(yyyymm / 100) as YYYY
export const getMonth = (yyyymm: YYYYMM): MM => yyyymm % 100 as MM

export const addMonth = (yyyymm: YYYYMM, numMonths = 1): YYYYMM => {
  const year = getYear(yyyymm)
  const month = getMonth(yyyymm)

  const newMonth = month + numMonths
  const wrappedMonth = ((newMonth - 1) % 12) + 1
  const yearsChange = Math.ceil(newMonth / 12) - 1
  const newYear = year + yearsChange

  return (newYear * 100) + wrappedMonth as YYYYMM
}

export const subMonth = (yyyymm: YYYYMM, numMonths = 1): YYYYMM => addMonth(yyyymm, numMonths * -1)

export const toYYYYMM = (date: Date): YYYYMM => (date.getFullYear() * 1000) + (date.getMonth() + 1) as YYYYMM
export const fromYYYYMM = (yyyymm: YYYYMM): Date => {
  const date = new Date(0)
  const year = getYear(yyyymm)
  const month = getMonth(yyyymm)
  date.setFullYear(year)
  date.setMonth(month - 1)
  return date
}

export const toYYYY = (date: Date): YYYY => date.getFullYear() as YYYY
export const fromYYYY = (yyyy: YYYY): Date => {
  const date = new Date(0)
  date.setFullYear(yyyy)
  return date
}

export const formatDateYYYY = (date: Date): string => toYYYY(date).toString()
export const formatDateYYYYMM = (date: Date): string => toYYYYMM(date).toString()