import { MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { Account } from "../../../../state/Account"
import { YYYYMM } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useAction } from "../../../../utils/mobx"

export const EditBalance = observer(function EditBalance({ account, date }: { account: Account, date: YYYYMM }) {
  const balance = account.balances.get(date)

  const editBalance = useAction(store => store.dialogs.editBalance(balance), [balance])

  return (
    <MenuItem onClick={editBalance}>£{formatNumber(balance.value)}</MenuItem>
  )
})