import { VisibilityOutlined } from "@mui/icons-material"
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
  const { accounts, people, perspective, showMonths, setPerspective } = useStore()

  const date = data[index]
  const now = getNow()

  const onClickYear = useBind(setPerspective, date)

  return (
    <div className={classNames('table-body table-row', {
      'table-row__in-perspective': showMonths ? date === perspective : getYear(date) === getYear(perspective),
      'table-row__now': showMonths ? date === now : getYear(date) === getYear(now)
    })} style={style}>
      <div className='table-cell table-column--date' onClick={onClickYear}>
        <div className='table-column--date--perspective-icon'><VisibilityOutlined /></div>
        <span className='table-column--date_year'>{!showMonths || getMonth(date) === 1 ? getYear(date) : ''}</span>
        {showMonths && <span className='table-column--date_month'>{format(fromYYYYMM(date), 'MMM')}</span>}
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