/**
 * Basic HTML implementation of balances to help debug performance issues - there are no custom components here just basic HTML
 */

import classNames from "classnames";
import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import { useStore } from "../../utils/mobx";
import { Person } from "../../state/Person";
import { Account } from "../../state/Account";
import { YYYYMM, fromYYYYMM, getMonth, getYear } from "../../utils/date";

import './BasicBalances.css'

const Header_PersonAge = observer(function Header_Person({ person }: { person: Person }) {
  return <th className="tableColumn__age">{person.name}</th>
})

const Header_AccountBalance = observer(function Header_AccountBalance({ account }: { account: Account }) {
  return <th>{account.name} ({account.owner.name})</th>
})

const HeaderRows = observer(function HeaderRows() {
  const { people, accounts } = useStore()

  return (
    <>
      <tr>
        <th className="tableColumn__date" />
        {people.values.map(person => (
          <th key={person.id} className="tableColumn__age" />
        ))}
        <th />
        <th colSpan={accounts.values.length}>Balances</th>
      </tr>
      <tr>
        <th className="tableColumn__date">Date</th>
        {people.values.map(person => (
          <Header_PersonAge key={person.id} person={person} />
        ))}
        <th>Income</th>
        <th>Total</th>
        {accounts.values.map(account => (
          <Header_AccountBalance key={account.id} account={account} />
        ))}
      </tr>
    </>
  )
})

const Cell_Date = observer(function Cell_Date({ date }: { date: YYYYMM }) {
  const { showMonths } = useStore()
  const year = getYear(date)

  if (!showMonths) {
    return year
  }

  const month = format(fromYYYYMM(date), 'MMM')
  const isYearStart = getMonth(date) === 1

  return isYearStart ? `${year} ${month}` : month
})

const Cell_Age = observer(function Cell_Age({ date, person }: { date: YYYYMM, person: Person }) {
  return person.getAge(date)
})

const formatter = new Intl.NumberFormat()
const formatNumber = (value: number) => formatter.format(Math.floor(value))

const Cell_Income = observer(function Cell_Income({ date }: { date: YYYYMM }) {
  const { people } = useStore()

  const income = people.values
    .map(person => person.getIncome(date))
    .reduce((sum, value) => sum + value, 0)

  return income ? formatNumber(income) : ''
})

const Row = observer(function Row({ date }: { date: YYYYMM }) {
  const { people } = useStore()
  const isYearEnd = getMonth(date) === 12

  return (
    <tr className={classNames({
      'tableRow--endOfYear': isYearEnd,
      'tableRow--midYear': !isYearEnd
    })}>
      <td className="tableColumn__date"><Cell_Date date={date} /></td>
      {people.values.map(person => (
        <td key={person.id} className="tableColumn__age"><Cell_Age date={date} person={person} /></td>
      ))}
      <td className="tableColumn__income"><Cell_Income date={date} /></td>
    </tr>
  )
})

const Rows = observer(function Rows() {
  const { allDates } = useStore()

  return (
    allDates.map(date => (
      <Row key={date} date={date} />
    ))
  )
})

export const BasicBalancesTable = observer(function BasicBalancesTable() {
  const { showAges, showMonths } = useStore()

  return (
    <table className={classNames({
      'tableBody--showAges': showAges,
      'tableBody--hideAges': !showAges,
      'tableBody--showMonths': showMonths,
      'tableBody--hideMonths': !showMonths,
    })}>
      <thead>
        <HeaderRows />
      </thead>
      <tbody>
        <Rows />
      </tbody>
    </table>
  )
})
