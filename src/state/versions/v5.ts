import type { V4 } from './v4';

type AccountId = string & { __accountId__: never }
type DepositId = string & { depositId__: never }
type PersonId = string & { __personId__: never }
type StrategyId = string & { __strategyId__: never }
type WithdrawalId = string & { __withdrawalId__: never }

type YYYYMM = number & { __yyyymm__: never }
type YYYY = number & { __yyyy__: never }

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

const migrateYYYYMM = (date: YYYYMM) => Math.floor(date / 100) as YYYY

export type V5 = {
  globalGrowth: number;
  strategyId: StrategyId | null;
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
    startingBalance: number;
    ownerId: PersonId;
    balances: {
      accountId: AccountId;
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
      startDate: YYYY | '__START__';
      repeating: boolean;
      endDate: YYYY | '__RETIREMENT__' | null;
      period: Period;
      accountId: AccountId;
      parentStrategyId: StrategyId;
    }[];
    withdrawals: {
      id: WithdrawalId;
      amount: number | null;
      type: WithdrawalType;
      startDate: YYYY | '__RETIREMENT__';
      repeating: boolean;
      endDate: YYYY | null;
      taxable: boolean;
      accountId: AccountId;
      parentStrategyId: StrategyId;
    }[];
  }[];
  version: 5;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isV5 = (snapshot: any): snapshot is V5 => snapshot.version === 5

export const migrateV5 = (snapshot: V4): V5 => {
  return {
    ...snapshot,
    version: 5,
    accounts: snapshot.accounts.map((account) => ({
      ...account,
      startingBalance: 0
    })),
    strategies: snapshot.strategies.map((strategy) => ({
      ...strategy,
      deposits: strategy.deposits.map((deposit) => ({
        ...deposit,
        startDate: typeof deposit.startDate === 'string' ? deposit.startDate : migrateYYYYMM(deposit.startDate),
        endDate: typeof deposit.endDate === 'string' || deposit.endDate === null ? deposit.endDate : migrateYYYYMM(deposit.endDate)
      })),
      withdrawals: strategy.withdrawals.map((withdrawal) => ({
        ...withdrawal,
        startDate: typeof withdrawal.startDate === 'string' ? withdrawal.startDate : migrateYYYYMM(withdrawal.startDate),
        endDate: withdrawal.endDate === null ? withdrawal.endDate : migrateYYYYMM(withdrawal.endDate)
      }))
    }))
  }
}