import { addMonths, isBefore } from 'date-fns';
import type { AccountId } from '../state/Account';
import { Balance } from '../state/Balance';
import type { PersonId } from '../state/Person';
import type { Store } from '../state/Store';
import { fromYYYYMMDD, toYYYYMM } from '../utils/date';

export type AccountData = {
  id: AccountId,
  balance: Balance | undefined,
  predicted: number | undefined
}

export type SavingsRow = {
  accounts: Array<AccountData>
  ages: Array<{ id: PersonId, dob: Date }>
  totalBalance: number | undefined
  totalPredicted: number | undefined
  date: Date
}

// For now hard coded
const startDate = new Date(2020, 0, 1)
const endDate = new Date(2070, 0, 1)

export const getSavingsTable = (store: Store) => {
  const table = [] as Array<SavingsRow>

  for (let date = startDate; isBefore(date, endDate); date = addMonths(date, 1)) {
    const yyyymm = toYYYYMM(date)
    const previous = table.length === 0 ? null : table[table.length - 1]

    const accounts = store.accounts.values.map((account, i) => {
      const previousBalance =
        previous?.accounts[i].balance?.value
        ?? previous?.accounts[i].predicted

      const balance = account.balances.getBalance(yyyymm)

      return ({
        id: account.id,
        balance: balance,
        predicted: previousBalance ? previousBalance * (1 + account.mer) : undefined,
      })
    })

    const hasBalance = accounts.some(account => account.balance)
    const totalBalance = hasBalance
      ? accounts.reduce((total, account) => total + (account.balance?.value ?? account.predicted ?? 0), 0)
      : undefined

    const hasPredicted = accounts.some(account => account.predicted !== undefined)
    const totalPredicted = hasPredicted
      ? accounts.reduce((total, account) => total + (account.predicted ?? 0), 0)
      : undefined

    table.push({
      date,
      accounts,
      ages: store.people.values.map(person => ({ id: person.id, dob: fromYYYYMMDD(person.dob) })),
      totalBalance,
      totalPredicted
    })
  }

  return table
}