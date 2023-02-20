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
export const getYearMonth = (year: YYYY, month: MM): YYYYMM => year * 100 + month as YYYYMM

// mod operator but supports negative numbers
const mod = (value: number, modulus: number) => ((value % modulus) + modulus) % modulus

export const addMonth = (yyyymm: YYYYMM, numMonths = 1): YYYYMM => {
  const year = getYear(yyyymm)
  const month = getMonth(yyyymm)

  const newMonth = month + numMonths
  const wrappedMonth = mod(newMonth - 1, 12) + 1
  const yearsChange = Math.ceil(newMonth / 12) - 1
  const newYear = year + yearsChange

  return (newYear * 100) + wrappedMonth as YYYYMM
}

export const subMonth = (yyyymm: YYYYMM, numMonths = 1): YYYYMM => addMonth(yyyymm, numMonths * -1)

export const datesInYear = (year: YYYY): Array<YYYYMM> => {
  let dates = []
  for(let month = 1 as MM; month <= 12; ++month) {
    dates.push(getYearMonth(year, month))
  }
  return dates
}

export const toYYYYMM = (date: Date): YYYYMM => getYearMonth(date.getFullYear() as YYYY, date.getMonth() + 1 as MM)
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
