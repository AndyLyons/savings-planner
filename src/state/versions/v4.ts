import type { V3 } from './v3';

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

export type V4 = {
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
      startDate: YYYYMM | '__START__';
      repeating: boolean;
      endDate: YYYYMM | '__RETIREMENT__' | null;
      period: Period;
      accountId: AccountId;
      parentStrategyId: StrategyId;
    }[];
    withdrawals: {
      id: WithdrawalId;
      amount: number | null;
      type: WithdrawalType;
      startDate: '__RETIREMENT__' | YYYYMM;
      repeating: boolean;
      endDate: YYYYMM | null;
      taxable: boolean;
      accountId: AccountId;
      parentStrategyId: StrategyId;
    }[];
  }[];
  version: 4;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isV4 = (snapshot: any): snapshot is V4 => snapshot.version === 4

export const migrateV4 = ({ strategy, ...snapshot }: V3): V4 => {
  return {
    ...snapshot,
    version: 4,
    strategyId: strategy,
    accounts: snapshot.accounts.map(({ owner, ...account }) => ({
      ...account,
      ownerId: owner,
      balances: account.balances.map(balance => ({
        ...balance,
        accountId: account.id
      }))
    })),
    strategies: snapshot.strategies.map(({ ...strategy }) => ({
      ...strategy,
      deposits: strategy.deposits.map(({ account, ...deposit }) => ({
        ...deposit,
        accountId: account,
        parentStrategyId: strategy.id
      })),
      withdrawals: strategy.withdrawals.map(({ account, ...withdrawal }) => ({
        ...withdrawal,
        accountId: account,
        parentStrategyId: strategy.id
      }))
    }))
  }
}