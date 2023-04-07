import type { V2 } from './v2';

type AccountId = string & { __accountId__: never }
type DepositId = string & { depositId__: never }
type PersonId = string & { __personId__: never }
type StrategyId = string & { __strategyId__: never }
type WithdrawalId = string & { __withdrawalId__: never }

type YYYYMM = number & { __yyyymm__: never }

enum Period {
  MONTH = 'month',
  YEAR ='year'
}

enum WithdrawalType {
  FIXED_PER_YEAR = 'FIXED_PER_YEAR',
  FIXED_PER_MONTH = 'FIXED_PER_MONTH',
  PERCENTAGE = 'PERCENTAGE',
  STATIC_PERCENTAGE = 'STATIC_PERCENTAGE',
  TAKE_INTEREST = 'TAKE_INTEREST'
}

export type V3 = {
  globalGrowth: number;
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
      taxable: boolean;
      account: AccountId;
    }[];
  }[];
  version: 3;
}

export const isV3 = (snapshot: any): snapshot is V3 => snapshot.version === 3

export const migrateV3 = ({ showIncomes, showAges, showMonths, perspective, ...rest }: V2): V3 => {
  return {
    ...rest,
    version: 3,
    strategies: rest.strategies.map(strategy => ({
      ...strategy,
      withdrawals: strategy.withdrawals.map(withdrawal => ({
        ...withdrawal,
        taxable: withdrawal.taxRate !== 0
      }))
    }))
  }
}