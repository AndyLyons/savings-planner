import { MenuItem } from "@mui/material"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import { Balance } from "../../../../state/Balance"
import { formatNumber } from "../../../../utils/format"
import { useAction } from "../../../../utils/mobx"
import { fromYYYYMM } from "../../../../utils/date"

export const EditBalance = observer(function EditBalance({ balance, showMonth }: { balance: Balance, showMonth: boolean }) {
  const editBalance = useAction(store => store.dialogs.editBalance(balance), [balance])

  return (
    <MenuItem onClick={editBalance}>{showMonth ? `${format(fromYYYYMM(balance.date), 'MMM')} - ` : ''}£{formatNumber(balance.value)}</MenuItem>
  )
})