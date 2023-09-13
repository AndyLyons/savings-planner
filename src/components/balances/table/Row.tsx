import { Expand } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import classNames from "classnames"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import { ListChildComponentProps } from "react-window"
import { YYYYMM, fromYYYYMM, getMonth, getNow, getYear } from "../../../utils/date"
import { useBind } from "../../../utils/hooks"
import { useStore } from "../../../utils/mobx"
import { AccountBalanceCell } from "./cell/AccountBalanceCell"
import { AgeCell } from "./cell/AgeCell"
import { TotalBalanceCell } from "./cell/TotalBalanceCell"
import { TotalIncomeCell } from "./cell/TotalIncomeCell"

type RowProps = ListChildComponentProps<Array<YYYYMM>>

const RowInner = observer(function RowInner(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people, perspective, isDateInExpandedYear, toggleExpandedYear } = useStore()

  const date = data[index]
  const now = getNow()
  const isExpanded = isDateInExpandedYear(date)
  const isYearHeader = !isExpanded || getMonth(date) === 1

  const onClickExpand = useBind(toggleExpandedYear, getYear(date))

  return (
    <div className={classNames('table-body table-row', {
      'table-row__in-perspective': isExpanded ? date === perspective : getYear(date) === getYear(perspective),
      'table-row__now': isExpanded ? date === now : getYear(date) === getYear(now),
      'table-row__is-year-header': isYearHeader,
      'table-row__is-expanded': isExpanded
    })} style={style}>
      <div className='table-cell table-column--date'>
        <IconButton
          className="table-column--date--expand-icon"
          onClick={onClickExpand}
          size="small"
          sx={{ marginLeft: '5px' }}
        >
          <Expand fontSize="inherit" />
        </IconButton>
        <span className='table-column--date_year'>{getYear(date)}</span>
        <span className='table-column--date_month'>{format(fromYYYYMM(date), 'MMM')}</span>
      </div>
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