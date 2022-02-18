import { addMonths, isBefore, min } from 'date-fns';
import memoize from 'proxy-memoize';
import { State } from '../state/app';
import { AccountId } from '../state/slices/accounts';
import { Balance } from '../state/slices/balances';
import { PersonId } from '../state/slices/people';
import { fromYYYYMM, fromYYYYMMDD } from '../utils/date';

type SavingsRow = {
  accounts: Array<{ id: AccountId, balance: number, interpolated: boolean }>
  ages: Array<{ id: PersonId, dob: Date }>
  balance: number
  date: Date
}

const getSortedBalances = memoize(({ balances }: State) =>
  Object.values(balances)
    .sort((balanceA, balanceB) =>
      Number.parseInt(balanceA.date) - Number.parseInt(balanceB.date)
    )
)

const getEarliestDate = memoize((balances: Array<Balance>) =>
  balances.length >= 1
    ? min([fromYYYYMM(balances[0].date), new Date()])
    : new Date()
)

// For now hard coded until 2070
const endDate = new Date(2070, 0, 1)

export const getSavingsTable = memoize((state: State) => {
  const { accountsIds, peopleIds, people } = state
  const table = [] as Array<SavingsRow>

  const balances = getSortedBalances(state)
  let date = getEarliestDate(balances)

  do {
    table.push({
      date,
      balance: 0,
      accounts: accountsIds.map(id => ({ id, balance: 0, interpolated: true })),
      // eslint-disable-next-line no-loop-func
      ages: peopleIds.map(id => ({ id, dob: fromYYYYMMDD(people[id].dob) }))
    })

    date = addMonths(date, 1)
  } while (isBefore(date, endDate))

  return table
})