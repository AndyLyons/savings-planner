import type { V1 } from './v1';
import { StoreJSON } from '../Store';
import { Period, YYYYMM } from '../../utils/date';

export type V2 = StoreJSON

const migrateYearToDate = (yyyy: number): YYYYMM => Number(`${yyyy}01`) as YYYYMM

export const isV2 = (json: any): json is V2 => json.version === 2

export const migrateV2 = (json: V1): V2 => {
  return ({
    ...json,
    version: 2,

    accounts: json.accounts.map(account => ({
      ...account,
      compoundPeriod: account.compoundPeriod === 12 ? Period.YEAR : Period.MONTH,

      balances: account.balances.map(({ year, ...balance }) => ({
        ...balance,
        date: migrateYearToDate(year)
      }))
    })),

    strategies: json.strategies.map(strategy => ({
      ...strategy,

      deposits: strategy.deposits.map(({ startYear, endYear, ...deposit }) => ({
        ...deposit,
        startDate: startYear === '__START__' ? startYear : migrateYearToDate(startYear),
        endDate: endYear === '__RETIREMENT__' || endYear === null ? endYear : migrateYearToDate(endYear)
      }))
    })),

    people: json.people.map(person => ({
      ...person,
      dob: migrateYearToDate(person.dob)
    }))
  })
}