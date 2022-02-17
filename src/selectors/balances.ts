import { State } from '../state/app';
import { Balance, BalanceId } from '../state/slices/balances';

export const getSortedBalances = ({ balances }: State) =>
  Object.entries(balances)
    .sort(([, balanceA], [, balanceB]) =>
      Number.parseInt(balanceA.date) - Number.parseInt(balanceB.date)
    ) as Array<[BalanceId, Balance]>