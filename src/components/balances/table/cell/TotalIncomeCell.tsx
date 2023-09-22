import { Tooltip } from "@mui/material"
import { observer } from "mobx-react-lite"
import { YYYYMM, datesInYear, getMonth, getYear } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"
import { IncomeBreakdown } from "../tooltip/IncomeBreakdown"
import classNames from "classnames"

export const TotalIncomeCell = observer(function TotalIncomeCell({ date }: { date: YYYYMM }) {
  const { people, isDateInExpandedYear } = useStore()

  const isFaded = isDateInExpandedYear(date) && getMonth(date) !== 12
  const dates = isDateInExpandedYear(date) ? [date] : datesInYear(getYear(date))

  const income = people.values
    .flatMap(person => dates.map(date => person.getIncome(date)))
    .reduce((sum, value) => sum + value, 0)

  return (
    <div className={classNames('table-cell table-column--total', {
      'table-cell__faded': isFaded
    })}>
      <Tooltip
        disableInteractive
        placement='bottom'
        title={<IncomeBreakdown date={date} />}
      >
        <span>{income ? formatNumber(income) : ''}</span>
      </Tooltip>
    </div>
  )
})