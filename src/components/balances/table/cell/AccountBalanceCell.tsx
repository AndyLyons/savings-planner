import { SwapHoriz, VisibilityOff } from "@mui/icons-material"
import { Button, Icon, Tooltip } from "@mui/material"
import classNames from "classnames"
import { observer } from "mobx-react-lite"
import { forwardRef, useCallback, useRef } from "react"
import { Account, AccountId } from "../../../../state/Account"
import { YYYYMM, getYear } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useBoolean } from "../../../../utils/hooks"
import { useStore } from "../../../../utils/mobx"
import { ArrowLeft } from "../../../icons/ArrowLeft"
import { ArrowRight } from "../../../icons/ArrowRight"
import { AccountMenu } from "../menu/AccountMenu"
import { AccountBreakdown } from "../tooltip/AccountBreakdown"

const getActionIcon = (showMonths: boolean, account: Account, date: YYYYMM) => {
  const hasDeposit = showMonths ? account.getDepositsTotal(date) !== 0 : account.getYearDepositsTotal(getYear(date)) !== 0
  const hasWithdrawal = showMonths ? account.getWithdrawalsTotal(date) !== 0 : account.getYearWithdrawalsTotal(getYear(date)) !== 0

  if (hasDeposit && hasWithdrawal) {
    return <SwapHoriz />
  }

  if (hasDeposit) {
    return <ArrowRight className='deposit-icon' />
  }

  if (hasWithdrawal) {
    return <ArrowLeft className='withdrawal-icon' />
  }

  // Use empty icon to reserve space in DOM
  return <Icon />
}

const getHiddenIcon = (showMonths: boolean, account: Account, date: YYYYMM) => {
  const deposits = showMonths ? account.getDepositsForDate(date) : account.getDepositsForYear(getYear(date))
  const withdrawals = showMonths ? account.getWithdrawalsForDate(date) : account.getWithdrawalsForYear(getYear(date))

  const isHiddenDeposits = deposits.length > 0 && deposits.some(deposit => deposit.hidden)
  const isHiddenWithdrawals = withdrawals.length > 0 && withdrawals.some(withdrawal => withdrawal.hidden)

  if (isHiddenDeposits || isHiddenWithdrawals) {
    return <VisibilityOff className='table--hidden-icon' />
  }

  return null
}

const AccountBalanceButton = observer(forwardRef<HTMLButtonElement, { account: Account, date: YYYYMM, onClick: () => void }>(
  function AccountBalanceButton({ account, date, onClick }, ref) {
    const { showMonths } = useStore()
    const [isTooltipOpen, showTooltip, hideTooltip] = useBoolean(false)

    const hasBalance = account.hasBalance(date)
    const balance = account.getBalance(date)
    const enteredBalance = hasBalance ? account.balances.get(date) : null
    const predictedBalance = account.getCalculatedBalance(date)

    const isUp = enteredBalance && predictedBalance !== 0 && (enteredBalance.value / predictedBalance) > 1.005
    const isDown = enteredBalance && predictedBalance !== 0 && (enteredBalance.value / predictedBalance) < 0.995

    const onClickInternal = useCallback(() => {
      hideTooltip()
      onClick()
    }, [onClick, hideTooltip])

    return (
      <Tooltip
        disableInteractive
        open={isTooltipOpen}
        onOpen={showTooltip}
        onClose={hideTooltip}
        onMouseLeave={hideTooltip}
        placement='bottom'
        title={<AccountBreakdown account={account} date={date} />}
      >
        <Button
          className={classNames({
            'table-column--account_add-balance': !hasBalance,
            'table-column--account_edit-balance': hasBalance,
            'table-column--account_edit-balance--up': isUp,
            'table-column--account_edit-balance--down': isDown
          })}
          onClick={onClickInternal}
          startIcon={
            <>
              {getActionIcon(showMonths, account, date)}
              {getHiddenIcon(showMonths, account, date)}
            </>
          }
          size='small'
          variant='contained'
          ref={ref}
        >
          {balance ? formatNumber(balance) : ''}
        </Button>
      </Tooltip>
    )
  })
)

export const AccountBalanceCell = observer(function AccountBalanceCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const { accounts } = useStore()
  const account = accounts.get(accountId)

  const [isMenuOpen, showMenu, hideMenu] = useBoolean(false)

  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className='table-cell table-column--account-balance'>
      <AccountBalanceButton
        account={account}
        date={date}
        onClick={showMenu}
        ref={buttonRef}
      />
      <AccountMenu
        account={account}
        anchorEl={buttonRef.current}
        date={date}
        isOpen={isMenuOpen}
        onClose={hideMenu}
      />
    </div>
  )
})