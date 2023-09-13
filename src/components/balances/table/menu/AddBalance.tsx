import { MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { Account } from "../../../../state/Account"
import { YYYYMM, getStartOfYear, getYear } from "../../../../utils/date"
import { useAction } from "../../../../utils/mobx"

export const AddBalance = observer(function AddBalance({ account, date }: { account: Account, date: YYYYMM }) {
  const createBalance = useAction(({ dialogs, isDateInExpandedYear }) => {
    const startDate = isDateInExpandedYear(date) ? date : getStartOfYear(getYear(date))
    dialogs.createBalance(account, { date: startDate })
  }, [date, account])

  return (
    <MenuItem onClick={createBalance}>Add...</MenuItem>
  )
})