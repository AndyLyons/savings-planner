import { MenuItem } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Account } from "../../../../state/Account";
import { YYYY } from "../../../../utils/date";
import { useAction, useStore } from "../../../../utils/mobx";

export const AddWithdrawal = observer(function AddWithdrawal({ account, year }: { account: Account, year: YYYY }) {
  const { strategy: currentStrategy } = useStore()

  const createWithdrawal = useAction(({ dialogs, strategy }) => {
    if (strategy) {
      dialogs.createWithdrawal(strategy, { accountId: account.id, startDate: year })
    }
  }, [account, year])

  return (
    <MenuItem disabled={!currentStrategy} onClick={createWithdrawal}>Add...</MenuItem>
  )
})