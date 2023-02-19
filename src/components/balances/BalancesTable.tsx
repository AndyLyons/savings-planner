import { CurrencyPound, SwapHoriz } from '@mui/icons-material'
import { Box, Button, Divider, ListItemIcon, ListSubheader, Menu, MenuItem, SvgIcon, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { format } from 'date-fns'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useMemo, useRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ListChildComponentProps, ListItemKeySelector } from 'react-window'
import { VariableSizeList  } from 'react-window'
import type { Account, AccountId } from '../../state/Account'
import type { Deposit } from '../../state/Deposit'
import type { PersonId } from '../../state/Person'
import { fromYYYYMM, getYear, getMonth, subMonth, YYYYMM } from '../../utils/date'
import { useBoolean } from '../../utils/hooks'
import { useAction, useStore } from '../../utils/mobx'

type Dates = Array<YYYYMM>

const formatter = new Intl.NumberFormat()
const formatNumber = (value: number) => formatter.format(Math.floor(value))

const AgeCell = observer(function AgeCell({ date, personId }: { date: YYYYMM, personId: PersonId }) {
  const age = useStore(store => store.people.get(personId).getAge(date))
  return <div className='table-cell table-column--age'>{age}</div>
})

const AccountBreakdown = observer(function AccountBreakdown({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const { accounts, showMonths } = useStore()
  const account = accounts.get(accountId)
  const previous = account.getBalance(subMonth(date, showMonths ? 1 : 12))
  const interest = showMonths ? account.getInterest(date) : account.getYearInterest(date)
  const deposits = showMonths ? account.getDeposits(date) : account.getYearDeposits(date)
  const withdrawals = showMonths ? account.getWithdrawals(date) : account.getYearWithdrawals(date)
  const calculatedBalance = account.getCalculatedBalance(date)

  return (
    <ul className='account-breakdown'>
      <li className='account-breakdown--date'>{format(fromYYYYMM(date), 'MMM yyyy')}</li>
      <li className='account-breakdown--existing'>£{formatNumber(previous)}</li>
      <li className='account-breakdown--add'>£{formatNumber(deposits)} deposits</li>
      <li className='account-breakdown--add'>£{formatNumber(interest)} interest</li>
      <li className='account-breakdown--subtract'>£{formatNumber(withdrawals)} withdrawals</li>
      <li className='account-breakdown--total'>£{formatNumber(calculatedBalance)}</li>
    </ul>
  )
})

function ArrowRight(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M 21 12 l -3.99 -4 v 3 H 10 v 2 h 7.01 v 3 L 21 12 z" />
    </SvgIcon>
  )
}

function ArrowLeft(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M 6.99 8 L3 12 l 3.99 4 v -3 H 14 v -2 H 6.99 v -3 z" />
    </SvgIcon>
  )
}

const getActionIcon = (showMonths: boolean, account: Account, date: YYYYMM) => {
  const hasDeposit = showMonths ? account.getDeposits(date) !== 0 : account.getYearDeposits(date) !== 0
  const hasWithdrawal = showMonths ? account.getWithdrawals(date) !== 0 : account.getYearWithdrawals(date) !== 0

  if (hasDeposit && hasWithdrawal) {
    return <SwapHoriz />
  }

  if (hasDeposit) {
    return <ArrowRight className='deposit-icon' />
  }

  if (hasWithdrawal) {
    return <ArrowLeft className='withdrawal-icon' />
  }

  return null
}

const EditBalanceMenu = observer(function EditBalanceMenu({ account, date }: { account: Account, date: YYYYMM }) {
  const balance = account.balances.get(date)

  const editBalance = useAction(store => store.dialogs.editBalance(balance), [balance])

  return (
    <MenuItem onClick={editBalance}>
      <ListItemIcon><CurrencyPound fontSize='small' /></ListItemIcon> Balance
    </MenuItem>
  )
})

const AddBalanceMenu = observer(function AddBalanceMenu({ account, date }: { account: Account, date: YYYYMM }) {
  const createBalance = useAction(store => store.dialogs.createBalance(account, { date }), [date, account])

  return (
    <MenuItem onClick={createBalance}>
      <ListItemIcon><CurrencyPound fontSize='small' /></ListItemIcon> Balance
    </MenuItem>
  )
})

const EditDepositMenu = observer(function DepositMenu({ deposit }: { deposit: Deposit }) {
  const editDeposit = useAction(store => store.dialogs.editDeposit(deposit), [deposit])

  return (
    <MenuItem onClick={editDeposit}>£{deposit.monthlyAmount} / month</MenuItem>
  )
})

const DepositsMenu = observer(function DepositsMenu({ account, date }: { account: Account, date: YYYYMM }) {
  const deposits = account.getDepositsForDate(date)

  return (
    <>
      <ListSubheader sx={{ lineHeight: '20px' }}>Deposits</ListSubheader>
      {deposits.map(deposit => (
        <EditDepositMenu key={deposit.id} deposit={deposit} />
      ))}
    </>
  )
})

const AccountBalanceCell = observer(function AccountBalanceCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const { accounts, showMonths} = useStore()
  const account = accounts.get(accountId)
  const balance = account.getBalance(date)
  const hasBalance = account.hasBalance(date)
  const predictedBalance = account.getCalculatedBalance(date)
  const enteredBalance = account.balances.get(date)

  const isUp = enteredBalance && predictedBalance !== 0 && (enteredBalance.value / predictedBalance) > 1.005
  const isDown = enteredBalance && predictedBalance !== 0 && (enteredBalance.value / predictedBalance) < 0.995

  const [isTooltipOpen, showTooltip, hideTooltip] = useBoolean(false)
  const [isMenuOpen, showMenu, hideMenu] = useBoolean(false)
  const onButtonClick = useCallback(() => {
    hideTooltip()
    showMenu()
  }, [showMenu, hideTooltip])

  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className='table-cell table-column--account-balance'>
      <Tooltip
        disableInteractive
        open={isTooltipOpen}
        onOpen={showTooltip}
        onClose={hideTooltip}
        placement='bottom'
        title={<AccountBreakdown date={date} accountId={accountId} />}
      >
        <Button
          className={classNames({
            'table-column--account_add-balance': !hasBalance,
            'table-column--account_edit-balance': hasBalance,
            'table-column--account_edit-balance--up': isUp,
            'table-column--account_edit-balance--down': isDown
          })}
          onClick={onButtonClick}
          startIcon={getActionIcon(showMonths, account, date)}
          size='small'
          variant='contained'
          ref={buttonRef}
        >
          {balance ? formatNumber(balance) : ''}
        </Button>
      </Tooltip>
      <Menu
        anchorEl={buttonRef.current}
        open={isMenuOpen}
        onClick={hideMenu}
        onClose={hideMenu}
      >
        {hasBalance && <EditBalanceMenu account={account} date={date} />}
        {!hasBalance && <AddBalanceMenu account={account} date={date} />}
        <Divider />
        <DepositsMenu account={account} date={date} />
      </Menu>
    </div>
  )
})

const TotalBalanceCell = observer(function TotalBalanceCell({ date }: { date: YYYYMM }) {
  const total = useStore(store =>
    store.accounts.values
      .map(account => account.getBalance(date))
      .reduce((sum, value) => sum + value, 0)
  )

  return (
    <div className='table-cell table-column--total'>{total ? formatNumber(total) : ''}</div>
  )
})

const AccountIncomeCell = observer(function AccountIncomeCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const { accounts, showMonths } = useStore()
  const account = accounts.get(accountId)
  const income = showMonths ? account.getWithdrawals(date) : account.getYearWithdrawals(date)

  return (
    <div className='table-cell table-column--account-income'>{income ? formatNumber(income) : ''}</div>
  )
})

const TotalIncomeCell = observer(function TotalIncomeCell({ date }: { date: YYYYMM }) {
  const { accounts, showMonths } = useStore()
  const withdrawals = accounts.values.map(account =>
    showMonths ? account.getWithdrawals(date) : account.getYearWithdrawals(date)
  )

  const total = withdrawals.reduce((sum, value) => sum + value, 0)

  return (
    <div className='table-cell table-column--total'>{total ? formatNumber(total) : ''}</div>
  )
})

type RowProps = ListChildComponentProps<Dates>

const TableRow = observer(function TableRow(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people, perspective, showMonths } = useStore()

  const date = data[index - 2] // -2 because of header rows
  const now = new Date()
  const isCurrentYear = getYear(date) === now.getFullYear()
  const isCurrentMonth = getMonth(date) === now.getMonth() + 1
  const isNow = showMonths ? isCurrentYear && isCurrentMonth : isCurrentYear

  const onClickYear = useAction(store => store.togglePerspective(date), [date])

  return (
    <div className={classNames('table-body table-row', {
      'table-row--perspective': perspective && date <= perspective,
      'table-row--perspective_first': date === perspective,
      'table-row--now': isNow
    })} style={style}>
      <div className='table-cell table-column--date' onClick={onClickYear}>
        <span className='table-column--date_year'>{!showMonths || getMonth(date) === 1 ? getYear(date) : ''}</span>
        {showMonths && <span className='table-column--date_month'>{format(fromYYYYMM(date), 'MMM')}</span>}
      </div>
      {people.keys.map(personId => (
        <AgeCell key={personId} date={date} personId={personId} />
      ))}
      <TotalIncomeCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountIncomeCell key={accountId} date={date} accountId={accountId} />
      ))}
      <TotalBalanceCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountBalanceCell key={accountId} date={date} accountId={accountId} />
      ))}
    </div>
  )
})

const TableHeader = observer(function TableHeader() {
  const { people, accounts, showIncomes } = useStore()
  const numAccounts = accounts.keys.length
  const numVisibleIncomes = showIncomes ? numAccounts : 0

  const sxIncomes = useMemo(() => ({ width: `${110 + (numVisibleIncomes * 110)}px` }), [numVisibleIncomes])
  const sxBalances = useMemo(() => ({ width: `${110 + (numAccounts * 110)}px` }), [numAccounts])

  return (
    <div className="table-header">
      <div className="table-row table-row--groups">
        <div className='table-cell--empty table-column--date'></div>
        {people.keys.map(personId => (
          <div key={personId} className='table-cell--empty table-column--age'></div>
        ))}
        <Box className='table-cell table-columns--incomes' sx={sxIncomes}>Income</Box>
        <Box className='table-cell table-columns--balances' sx={sxBalances}>Balance</Box>
      </div>
      <div className="table-row table-row--headers">
        <div className='table-cell table-column--date'>Date</div>
        {people.values.map(person => (
          <div key={person.id} className='table-cell table-column--age'>{person.name}</div>
        ))}
        <div className='table-cell table-column--total'>Total (£)</div>
        {accounts.values.map(account => (
          <div key={account.id} className='table-cell table-column--account-income'>{account.name} ({account.owner.name})</div>
        ))}
        <div className='table-cell table-column--total'>Total (£)</div>
        {accounts.values.map(account => (
          <div key={account.id} className='table-cell table-column--account-balance'>{account.name} ({account.owner.name})</div>
        ))}
      </div>
    </div>
  )
})

function TableRowWrapper(props: RowProps) {
  // Index 0 & 1 are the headers which are rendered separately
  return props.index <= 1 ? null : <TableRow {...props} />
}

const TableBody = forwardRef<HTMLDivElement>(function TableBody({ children, ...rest }, ref) {
  return (
    <div ref={ref} {...rest}>
      <TableHeader />
      {children}
    </div>
  )
})

const getItemSize = (index: number) => index === 1 ? 60 : 24
const getKey: ListItemKeySelector<Dates> = (index, years) => index === 0 ? '__HEADER__' : years[index - 1]

const Table = observer(function Table({ height, width }: { height: number, width: number }) {
  const { dates, showIncomes, showAges } = useStore()

  return (
    <VariableSizeList
      className={classNames('table', {
        'hide-ages': !showAges,
        'hide-incomes': !showIncomes
      })}
      height={height}
      width={width}
      itemCount={dates.length + 2} // +2 for header rows
      itemData={dates}
      innerElementType={TableBody}
      itemKey={getKey}
      itemSize={getItemSize}
    >
      {TableRowWrapper}
    </VariableSizeList>
  )
})

export const BalancesTable = function BalancesTable() {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table height={height} width={width} />
      )}
    </AutoSizer>
  )
}