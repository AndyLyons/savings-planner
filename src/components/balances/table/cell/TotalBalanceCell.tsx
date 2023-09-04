import { observer } from "mobx-react-lite"
import { YYYYMM } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"

export const TotalBalanceCell = observer(function TotalBalanceCell({ date }: { date: YYYYMM }) {
  const total = useStore(store =>
    store.accounts.values
      .map(account => account.getBalance(date))
      .reduce((sum, value) => sum + value, 0)
  )

  return (
    <div className='table-cell table-column--total'>{total ? formatNumber(total) : ''}</div>
  )
})