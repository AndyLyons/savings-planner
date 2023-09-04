import { MenuItem } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Account } from "../../../../state/Account";
import { YYYY } from "../../../../utils/date";
import { useAction, useStore } from "../../../../utils/mobx";

export const AddDeposit = observer(function AddDeposit({ account, year }: { account: Account, year: YYYY }) {
  const { strategy: currentStrategy } = useStore()

  const createDeposit = useAction(({ dialogs, strategy }) => {
    if (strategy) {
      dialogs.createDeposit(strategy, { accountId: account.id, startDate: year })
    }
  }, [account, year])

  return (
    <MenuItem disabled={!currentStrategy} onClick={createDeposit}>Add...</MenuItem>
  )
})