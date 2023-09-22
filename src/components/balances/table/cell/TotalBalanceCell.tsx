import { observer } from "mobx-react-lite"
import { YYYYMM, getMonth } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"
import classNames from "classnames"

export const TotalBalanceCell = observer(function TotalBalanceCell({ date }: { date: YYYYMM }) {
  const { isDateInExpandedYear } = useStore()
  const isFaded = isDateInExpandedYear(date) && getMonth(date) !== 12

  const total = useStore(store =>
    store.accounts.values
      .map(account => account.getBalance(date))
      .reduce((sum, value) => sum + value, 0)
  )

  return (
    <div className={classNames('table-cell table-column--total', {
      'table-cell__faded': isFaded
    })}>{total ? formatNumber(total) : ''}</div>
  )
})