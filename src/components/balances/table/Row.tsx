import classNames from "classnames"
import { observer } from "mobx-react-lite"
import { ListChildComponentProps } from "react-window"
import { YYYYMM, getMonth, getNow, getYear } from "../../../utils/date"
import { useStore } from "../../../utils/mobx"
import { AccountBalanceCell } from "./cell/AccountBalanceCell"
import { AgeCell } from "./cell/AgeCell"
import { TotalBalanceCell } from "./cell/TotalBalanceCell"
import { TotalIncomeCell } from "./cell/TotalIncomeCell"
import { DateCell } from "./cell/DateCell"

type RowProps = ListChildComponentProps<Array<YYYYMM>>

const RowInner = observer(function RowInner(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people, perspective, isDateInExpandedYear } = useStore()

  const date = data[index]
  const now = getNow()
  const isExpanded = isDateInExpandedYear(date)
  const isYearHeader = !isExpanded || getMonth(date) === 1

  return (
    <div className={classNames('table-body table-row', {
      'table-row__in-perspective': isExpanded ? date === perspective : getYear(date) === getYear(perspective),
      'table-row__now': isExpanded ? date === now : getYear(date) === getYear(now),
      'table-row__is-year-header': isYearHeader,
      'table-row__is-expanded': isExpanded
    })} style={style}>
      <DateCell date={date} />
      {people.keys.map(personId => (
        <AgeCell key={personId} date={date} personId={personId} />
      ))}
      <TotalIncomeCell date={date} />
      <TotalBalanceCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountBalanceCell key={accountId} date={date} accountId={accountId} />
      ))}
    </div>
  )
})

export function Row({ index, ...rest }: RowProps) {
  // Index 0 is the header which is rendered separately
  return index === 0 ? null : <RowInner index={index - 1} {...rest} />
}