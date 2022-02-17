import { addMonths, differenceInYears, format, isBefore, min } from 'date-fns'
import { log, Period, State } from '../state/app'
import { AccountId } from '../state/slices/accounts'
import { Balance, BalanceId } from '../state/slices/balances'
import { PersonId } from '../state/slices/people'
import { fromYYYYMM, fromYYYYMMDD, YYYYMMDD } from '../utils/date'
import { getSortedBalances } from './balances'

type SavingsRow = {
  month: string
  year: string
  ages: Array<{ id: PersonId, age: number }>
  balance: number
  accounts: Array<{ id: AccountId, balance: number, interpolated: boolean }>
}

const getAgeAtDate = (dob: YYYYMMDD, date: Date) =>
  differenceInYears(date, fromYYYYMMDD(dob))

const getStartDate = (balances: Array<[BalanceId, Balance]>, showHistory: boolean) =>
  showHistory && balances.length >= 1
    ? min([fromYYYYMM(balances[0][1].date), new Date()])
    : new Date()

// For now hard coded until 2070
const endDate = new Date(2070, 0, 1)

export const getSavingsTable = (state: State) => {
  const { accountsIds, peopleIds, people, period, showHistory } = state
  const table = [] as Array<SavingsRow>

  const balances = getSortedBalances(state)

  let date = getStartDate(balances, showHistory)
  let count = 0

  do {
    if (count++ > 500) {
      break
    }

    const year = format(date, 'yyyy')
    const month = format(date, 'MMM')
    log('rendering date', date, year, month)

    table.push({
      year,
      month,
      balance: 0,
      accounts: accountsIds.map(id => ({ id, balance: 0, interpolated: true })),
      // eslint-disable-next-line no-loop-func
      ages: peopleIds.map(id => ({ id, age: getAgeAtDate(people[id].dob, date) }))
    })

    date = addMonths(date, 1)
  } while (isBefore(date, endDate))

  return table
}