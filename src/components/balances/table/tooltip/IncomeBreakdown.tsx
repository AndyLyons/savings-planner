import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import { Person } from "../../../../state/Person"
import { YYYYMM, datesInYear, fromYYYYMM, getYear } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"

const IncomeBreakdownPerPerson = observer(function IncomeBreakdownPerPerson({ date, person }: { date: YYYYMM, person: Person }) {
  const { showMonths } = useStore()

  const dates = showMonths ? [date] : datesInYear(getYear(date))
  const withdrawals = dates.map(date => person.getWithdrawals(date)).reduce((sum, value) => sum + value, 0)
  const tax = dates.map(date => person.getTax(date)).reduce((sum, value) => sum + value, 0)

  return (
    <>
      <li className='income-breakdown--name'>{person.name}</li>
      <li className='income-breakdown--add'>£{formatNumber(withdrawals)} w/d</li>
      <li className='income-breakdown--subtract'>£{formatNumber(tax)} tax ({formatNumber(tax / withdrawals * 100)}%)</li>
    </>
  )
})

export const IncomeBreakdown = observer(function IncomeBreakdown({ date }: { date: YYYYMM }) {
  const { people, showMonths } = useStore()

  const dates = showMonths ? [date] : datesInYear(getYear(date))

  const income = people.values
    .flatMap(person => dates.map(date => person.getIncome(date)))
    .reduce((sum, value) => sum + value, 0)

  return (
    <ul className='income-breakdown'>
      <li className='income-breakdown--date'>{format(fromYYYYMM(date), showMonths ? 'MMM yyyy' : 'yyyy')}</li>
      {people.values.map(person => (
        <IncomeBreakdownPerPerson key={person.id} date={date} person={person} />
      ))}
      <li className='income-breakdown--name'>Total</li>
      <li className='income-breakdown--total'>£{formatNumber(income)}</li>
      <li className='income-breakdown--total'>£{formatNumber(income / 12)} / month</li>
    </ul>
  )
})