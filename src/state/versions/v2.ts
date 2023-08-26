import type { V1 } from './v1';

type AccountId = string & { __accountId__: never }
type DepositId = string & { depositId__: never }
type PersonId = string & { __personId__: never }
type StrategyId = string & { __strategyId__: never }
type WithdrawalId = string & { __withdrawalId__: never }

type YYYYMM = number & { __yyyymm__: never }

enum Period {
  MONTH = 'month',
  YEAR = 'year'
}

enum WithdrawalType {
  FIXED_PER_YEAR = 'FIXED_PER_YEAR',
  FIXED_PER_MONTH = 'FIXED_PER_MONTH',
  PERCENTAGE = 'PERCENTAGE',
  STATIC_PERCENTAGE = 'STATIC_PERCENTAGE',
  TAKE_INTEREST = 'TAKE_INTEREST'
}

export type V2 = {
  globalGrowth: number;
  showIncomes: boolean;
  showAges: boolean;
  showMonths: boolean;
  perspective: YYYYMM | null;
  strategy: StrategyId | null;
  people: {
    id: PersonId;
    name: string;
    dob: YYYYMM;
  }[];
  accounts: {
    id: AccountId;
    name: string;
    growth: number | null;
    compoundPeriod: Period;
    owner: PersonId;
    balances: {
      date: YYYYMM;
      value: number;
    }[];
  }[];
  strategies: {
    id: StrategyId;
    name: string;
    deposits: {
      id: DepositId;
      amount: number;
      startDate: YYYYMM | '__START__';
      repeating: boolean;
      endDate: YYYYMM | '__RETIREMENT__' | null;
      period: Period;
      account: AccountId;
    }[];
    withdrawals: {
      id: WithdrawalId;
      amount: number | null;
      type: WithdrawalType;
      startDate: '__RETIREMENT__' | YYYYMM;
      repeating: boolean;
      endDate: YYYYMM | null;
      taxRate: number;
      account: AccountId;
    }[];
  }[];
  version: 2;
}

const migrateYearToDate = (yyyy: number, isStart: boolean): YYYYMM => Number(`${yyyy}${isStart ? '01' : '12'}`) as YYYYMM

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isV2 = (snapshot: any): snapshot is V2 => snapshot.version === 2

export const migrateV2 = (snapshot: V1): V2 => {
  return ({
    ...snapshot,
    version: 2,
    showMonths: false,
    perspective: null,

    accounts: snapshot.accounts.map(account => ({
      ...account,
      compoundPeriod: account.compoundPeriod === 1 ? Period.YEAR : Period.MONTH,

      balances: account.balances.map(({ year, ...balance }) => ({
        ...balance,
        date: migrateYearToDate(year, true)
      }))
    })),

    strategies: snapshot.strategies.map(strategy => ({
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

    people: snapshot.people.map(person => ({
      ...person,
      dob: migrateYearToDate(person.dob, true)
    }))
  })
}