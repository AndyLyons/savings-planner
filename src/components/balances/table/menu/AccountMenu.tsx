import { Divider, ListSubheader, Menu } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ComponentProps, useMemo } from "react";
import { Account } from "../../../../state/Account";
import { YYYYMM, getYear } from "../../../../utils/date";
import { EditDeposit } from "./EditDeposit";
import { EditBalance } from "./EditBalance";
import { AddBalance } from "./AddBalance";
import { AddDeposit } from "./AddDeposit";
import { EditWithdrawal } from "./EditWithdrawal";
import { AddWithdrawal } from "./AddWithdrawal";

interface AccountMenuProps {
  account: Account
  anchorEl: ComponentProps<typeof Menu>['anchorEl']
  date: YYYYMM
  isOpen: boolean
  onClose: () => void
}

export const AccountMenu = observer(function AccountMenu({ account, anchorEl, date, isOpen, onClose }: AccountMenuProps) {
  const year = getYear(date)
  const hasBalance = account.hasBalance(date)

  const sxLineHeight = useMemo(() => ({ lineHeight: '20px' }), [])

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClick={onClose}
      onClose={onClose}
    >
      <ListSubheader sx={sxLineHeight}>Balance</ListSubheader>
      {hasBalance && <EditBalance account={account} date={date} />}
      {!hasBalance && <AddBalance account={account} date={date} />}

      <Divider />

      <ListSubheader sx={sxLineHeight}>Deposits ({year})</ListSubheader>
      {account.getDepositsForYear(year).map(deposit => (
        <EditDeposit key={deposit.id} year={year} deposit={deposit} />
      ))}
      <AddDeposit account={account} year={year} />

      <Divider />

      <ListSubheader sx={sxLineHeight}>Withdrawals ({year})</ListSubheader>
      {account.getWithdrawalsForYear(year).map(withdrawal => (
        <EditWithdrawal key={withdrawal.id} year={year} withdrawal={withdrawal} />
      ))}
      <AddWithdrawal account={account} year={year} />
    </Menu>
  )
})