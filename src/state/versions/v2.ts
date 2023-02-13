import type { V1 } from './v1';
import { StoreJSON } from '../Store';
import { Period, YYYYMM } from '../../utils/date';

export type V2 = StoreJSON

const migrateYearToDate = (yyyy: number, isStart: boolean): YYYYMM => Number(`${yyyy}${isStart ? '01' : '12'}`) as YYYYMM

export const isV2 = (json: any): json is V2 => json.version === 2

export const migrateV2 = (json: V1): V2 => {
  return ({
    ...json,
    version: 2,

    accounts: json.accounts.map(account => ({
      ...account,
      compoundPeriod: account.compoundPeriod === 1 ? Period.YEAR : Period.MONTH,

      balances: account.balances.map(({ year, ...balance }) => ({
        ...balance,
        date: migrateYearToDate(year, true)
      }))
    })),

    strategies: json.strategies.map(strategy => ({
      ...strategy,

      deposits: strategy.deposits.map(({ startYear, endYear, ...deposit }) => ({
        ...deposit,
        startDate: startYear === '__START__' ? startYear : migrateYearToDate(startYear, true),
        endDate: endYear === '__RETIREMENT__' || endYear === null ? endYear : migrateYearToDate(endYear, false)
      })),

      withdrawals: strategy.withdrawals.map(({ startYear, endYear, ...withdrawal }) => ({
        ...withdrawal,
        startDate: startYear === '__RETIREMENT__' ? startYear : migrateYearToDate(startYear, true),
        endDate: endYear === null ? endYear : migrateYearToDate(endYear, false)
      }))
    })),

    people: json.people.map(person => ({
      ...person,
      dob: migrateYearToDate(person.dob, true)
    }))
  })
}