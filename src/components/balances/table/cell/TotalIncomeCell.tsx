import { Tooltip } from "@mui/material"
import { observer } from "mobx-react-lite"
import { YYYYMM, datesInYear, getYear } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"
import { IncomeBreakdown } from "../tooltip/IncomeBreakdown"

export const TotalIncomeCell = observer(function TotalIncomeCell({ date }: { date: YYYYMM }) {
  const { people, showMonths } = useStore()

  const dates = showMonths ? [date] : datesInYear(getYear(date))

  const income = people.values
    .flatMap(person => dates.map(date => person.getIncome(date)))
    .reduce((sum, value) => sum + value, 0)

  return (
    <div className='table-cell table-column--total'>
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