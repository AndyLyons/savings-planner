import { addMonths, isBefore, min } from 'date-fns';
import type { AccountId } from '../state/Account';
import type { PersonId } from '../state/Person';
import type { Store } from '../state/Store';
import { fromYYYYMM, fromYYYYMMDD } from '../utils/date';

type SavingsRow = {
  accounts: Array<{ id: AccountId, balance: number, interpolated: boolean }>
  ages: Array<{ id: PersonId, dob: Date }>
  balance: number
  date: Date
}

const getStartDate = (store: Store) => {
  const earliestBalance = store.balances.earliestBalance
  const earliestDate = earliestBalance
    ? min([fromYYYYMM(earliestBalance), new Date()])
    : new Date()
  return new Date(earliestDate.getFullYear(), 0, 1)
}

// For now hard coded until 2070
const endDate = new Date(2070, 0, 1)

export const getSavingsTable = (store: Store) => {
  const table = [] as Array<SavingsRow>

  let date = getStartDate(store)

  do {
    table.push({
      date,
      balance: 0,
      accounts: store.accounts.values.map(account => ({ id: account.id, balance: 0, interpolated: true })),
      // eslint-disable-next-line no-loop-func
      ages: store.people.values.map(person => ({ id: person.id, dob: fromYYYYMMDD(person.dob) }))
    })

    date = addMonths(date, 1)
  } while (isBefore(date, endDate))

  return table
}