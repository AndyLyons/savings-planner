import { AltRoute, SwapHoriz, StopCircleOutlined, VisibilityOutlined, VisibilityOff, Visibility } from '@mui/icons-material'
import { Box, Button, Divider, Icon, IconButton, ListItem, ListItemButton, ListSubheader, Menu, MenuItem, SvgIcon, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { format } from 'date-fns'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useMemo, useRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ListChildComponentProps, ListItemKeySelector } from 'react-window'
import { VariableSizeList } from 'react-window'
import type { Account, AccountId } from '../../state/Account'
import type { Deposit } from '../../state/Deposit'
import type { PersonId } from '../../state/Person'
import { Withdrawal } from '../../state/Withdrawal'
import { fromYYYYMM, getYear, getMonth, subMonth, YYYYMM, getNow, asMonth, getYYYYMM, subYear, YYYY } from '../../utils/date'
import { useBind, useBoolean } from '../../utils/hooks'
import { useAction, useStore } from '../../utils/mobx'

type Dates = Array<YYYYMM>

const formatter = new Intl.NumberFormat()
const formatNumber = (value: number) => formatter.format(Math.floor(value))

const AgeCell = observer(function AgeCell({ date, personId }: { date: YYYYMM, personId: PersonId }) {
  const age = useStore(store => store.people.get(personId).getAge(date))
  return <div className='table-cell table-column--age'>{age}</div>
})

const AccountBreakdown = observer(function AccountBreakdown({ account, date }: { account: Account, date: YYYYMM }) {
  const { showMonths } = useStore()
  const previous = account.getBalance(subMonth(date, showMonths ? 1 : 12))
  const interest = showMonths ? account.getInterestTotal(date) : account.getYearInterestTotal(getYear(date))
  const deposits = showMonths ? account.getDepositsTotal(date) : account.getYearDepositsTotal(getYear(date))
  const withdrawals = showMonths ? account.getWithdrawalsTotal(date) : account.getYearWithdrawalsTotal(getYear(date))
  const calculatedBalance = account.getCalculatedBalance(date)

  return (
    <ul className='account-breakdown'>
      <li className='account-breakdown--date'>{format(fromYYYYMM(date), showMonths ? 'MMM yyyy' : 'yyyy')}</li>
      <li className='account-breakdown--existing'>£{formatNumber(previous)}</li>
      <li className='account-breakdown--add'>£{formatNumber(deposits)} deposits</li>
      <li className='account-breakdown--add'>£{formatNumber(interest)} interest</li>
      <li className='account-breakdown--subtract'>£{formatNumber(withdrawals)} w/d</li>
      <li className='account-breakdown--total'>£{formatNumber(calculatedBalance)}</li>
    </ul>
  )
})

const IncomeBreakdown = observer(function IncomeBreakdown({ date }: { date: YYYYMM }) {
  const { accounts, showMonths } = useStore()

  const withdrawals = accounts.values
    .map(account => showMonths ? account.getWithdrawalsTotal(date) : account.getYearWithdrawalsTotal(getYear(date)))
    .reduce((sum, value) => sum + value, 0)

  const income = accounts.values
    .map(account => showMonths ? account.getIncomeTotal(date) : account.getYearIncomeTotal(getYear(date)))
    .reduce((sum, value) => sum + value, 0)

  const tax = withdrawals - income

  return (
    <ul className='income-breakdown'>
      <li className='income-breakdown--date'>{format(fromYYYYMM(date), showMonths ? 'MMM yyyy' : 'yyyy')}</li>
      <li className='income-breakdown--add'>£{formatNumber(withdrawals)} w/d</li>
      <li className='income-breakdown--subtract'>£{formatNumber(tax)} tax</li>
      <li className='income-breakdown--total'>£{formatNumber(income)}</li>
      <li className='income-breakdown--total'>£{formatNumber(income / 12)} / month</li>
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

const EditBalanceMenu = observer(function EditBalanceMenu({ account, date }: { account: Account, date: YYYYMM }) {
  const balance = account.balances.get(date)

  const editBalance = useAction(store => store.dialogs.editBalance(balance), [balance])

  return (
    <MenuItem onClick={editBalance}>£{formatNumber(balance.value)}</MenuItem>
  )
})

const AddBalanceMenu = observer(function AddBalanceMenu({ account, date }: { account: Account, date: YYYYMM }) {
  const createBalance = useAction(({ dialogs, showMonths }) => {
    const startDate = showMonths ? date : getYYYYMM(getYear(date), asMonth(1))
    dialogs.createBalance(account, { date: startDate })
  }, [date, account])

  return (
    <MenuItem onClick={createBalance}>Add...</MenuItem>
  )
})

const EditDepositMenu = observer(function EditDepositMenu({ year, deposit }: { year: YYYY, deposit: Deposit }) {
  const editDeposit = useAction(store => store.dialogs.editDeposit(deposit), [deposit])

  const splitDeposit = useAction(store => {
    const { strategy } = store
    if (strategy) {
      const { id: _, ...depositSnapshot } = deposit.snapshot
      const startDate = year
      store.dialogs.createDeposit(
        strategy,
        {
          ...depositSnapshot,
          startDate
        },
        () => {
          deposit.endDate = subYear(startDate)
        }
      )
    }
  }, [deposit])

  const stopDeposit = useAction(() => {
    deposit.endDate = year
  }, [])

  const isStartDate = year === deposit.startDateValue
  const isSingleYear = !deposit.repeating || deposit.startDateValue === deposit.endDateValue

  return (
    <ListItem dense disablePadding secondaryAction={
      <>
        <IconButton edge="end" onClick={deposit.toggleHidden} size='small'>
          {deposit.hidden ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
        </IconButton>
        <IconButton disabled={isSingleYear} edge="end" onClick={stopDeposit} size='small'>
          <StopCircleOutlined fontSize='inherit' />
        </IconButton>
        <IconButton disabled={isStartDate} edge="end" onClick={splitDeposit} size='small'>
          <AltRoute fontSize='inherit' />
        </IconButton>
      </>
    }>
      <ListItemButton onClick={editDeposit} sx={{ textDecoration: deposit.hidden ? 'line-through' : '', paddingRight: '70px !important' }}>{deposit.description}</ListItemButton>
    </ListItem>
  )
})

const DepositsMenu = observer(function DepositsMenu({ account, year }: { account: Account, year: YYYY }) {
  const { strategy: currentStrategy } = useStore()

  const createDeposit = useAction(({ dialogs, strategy }) => {
    if (strategy) {
      dialogs.createDeposit(strategy, { accountId: account.id, startDate: year })
    }
  }, [account, year])

  return (
    <>
      {account.getDepositsForYear(year).map(deposit => (
        <EditDepositMenu key={deposit.id} year={year} deposit={deposit} />
      ))}
      <MenuItem disabled={!currentStrategy} onClick={createDeposit}>Add...</MenuItem>
    </>
  )
})

const EditWithdrawalMenu = observer(function EditWithdrawalMenu({ year, withdrawal }: { year: YYYY, withdrawal: Withdrawal }) {
  const editWithdrawal = useAction(store => store.dialogs.editWithdrawal(withdrawal), [withdrawal])

  const splitWithdrawal = useAction(store => {
    const { strategy } = store
    if (strategy) {
      const { id: _, ...withdrawalSnapshot } = withdrawal.snapshot
      const startDate = year
      store.dialogs.createWithdrawal(
        strategy,
        {
          ...withdrawalSnapshot,
          startDate
        },
        () => {
          withdrawal.endDate = subYear(startDate)
        }
      )
    }
  }, [withdrawal])

  const stopWithdrawal = useAction(() => {
    withdrawal.endDate = year
  }, [])

  const isStartDate = year === withdrawal.startDateValue
  const isSingleYear = !withdrawal.repeating || withdrawal.startDateValue === withdrawal.endDate

  return (
    <ListItem dense disablePadding secondaryAction={
      <>
        <IconButton edge="end" onClick={withdrawal.toggleHidden} size='small'>
          {withdrawal.hidden ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
        </IconButton>
        <IconButton disabled={isSingleYear} edge="end" onClick={stopWithdrawal} size='small'>
          <StopCircleOutlined fontSize='inherit' />
        </IconButton>
        <IconButton disabled={isStartDate} edge="end" onClick={splitWithdrawal} size='small'>
          <AltRoute fontSize='inherit' />
        </IconButton>
      </>
    }>
      <ListItemButton onClick={editWithdrawal} sx={{ textDecoration: withdrawal.hidden ? 'line-through' : '', paddingRight: '95px !important' }}>{withdrawal.description}</ListItemButton>
    </ListItem>
  )
})

const WithdrawalsMenu = observer(function WithdrawalsMenu({ account, year }: { account: Account, year: YYYY }) {
  const { strategy: currentStrategy } = useStore()

  const createWithdrawal = useAction(({ dialogs, strategy }) => {
    if (strategy) {
      dialogs.createWithdrawal(strategy, { accountId: account.id, startDate: year })
    }
  }, [account, year])

  return (
    <>
      {account.getWithdrawalsForYear(year).map(withdrawal => (
        <EditWithdrawalMenu key={withdrawal.id} year={year} withdrawal={withdrawal} />
      ))}
      <MenuItem disabled={!currentStrategy} onClick={createWithdrawal}>Add...</MenuItem>
    </>
  )
})

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

const AccountBalanceCell = observer(function AccountBalanceCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const { accounts } = useStore()
  const account = accounts.get(accountId)
  const hasBalance = account.hasBalance(date)
  const year = getYear(date)

  const [isMenuOpen, showMenu, hideMenu] = useBoolean(false)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const sxLineHeight = useMemo(() => ({ lineHeight: '20px' }), [])

  return (
    <div className='table-cell table-column--account-balance'>
      <AccountBalanceButton
        account={account}
        date={date}
        onClick={showMenu}
        ref={buttonRef}
      />
      <Menu
        anchorEl={buttonRef.current}
        open={isMenuOpen}
        onClick={hideMenu}
        onClose={hideMenu}
      >
        <ListSubheader sx={sxLineHeight}>Balance</ListSubheader>
        {hasBalance && <EditBalanceMenu account={account} date={date} />}
        {!hasBalance && <AddBalanceMenu account={account} date={date} />}

        <Divider />

        <ListSubheader sx={sxLineHeight}>Deposits ({year})</ListSubheader>
        <DepositsMenu account={account} year={year} />

        <Divider />

        <ListSubheader sx={sxLineHeight}>Withdrawals ({year})</ListSubheader>
        <WithdrawalsMenu account={account} year={year} />
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

const TotalIncomeCell = observer(function TotalIncomeCell({ date }: { date: YYYYMM }) {
  const { accounts, showMonths } = useStore()
  const income = accounts.values
    .map(account => showMonths ? account.getIncomeTotal(date) : account.getYearIncomeTotal(getYear(date)))
    .reduce((sum, value) => sum + value, 0)

  return (
    <div className='table-cell table-column--total'>
      <Tooltip
        disableInteractive
        placement='bottom'
        title={<IncomeBreakdown date={date} />}
      >
        <span>{income ? formatNumber(income) : ''}</span>
      </Tooltip>
    </div>
  )
})

type RowProps = ListChildComponentProps<Dates>

const TableRow = observer(function TableRow(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people, perspective, showMonths, setPerspective } = useStore()

  const date = data[index]
  const now = getNow()

  const onClickYear = useBind(setPerspective, date)

  return (
    <div className={classNames('table-body table-row', {
      'table-row__in-perspective': showMonths ? date === perspective : getYear(date) === getYear(perspective),
      'table-row__now': showMonths ? date === now : getYear(date) === getYear(now)
    })} style={style}>
      <div className='table-cell table-column--date' onClick={onClickYear}>
        <div className='table-column--date--perspective-icon'><VisibilityOutlined /></div>
        <span className='table-column--date_year'>{!showMonths || getMonth(date) === 1 ? getYear(date) : ''}</span>
        {showMonths && <span className='table-column--date_month'>{format(fromYYYYMM(date), 'MMM')}</span>}
      </div>
      {people.keys.map(personId => (
        <AgeCell key={personId} date={date} personId={personId} />
      ))}
      <TotalIncomeCell date={date} />
      <TotalBalanceCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountBalanceCell key={accountId} date={date} accountId={accountId} />
      ))}
    </div>
  )
})

const TableHeader = observer(function TableHeader() {
  const { dialogs, people, accounts, togglePerspective } = useStore()
  const numAccounts = accounts.keys.length

  const sxIncomes = useMemo(() => ({ width: '110px' }), [])
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
        <div className='table-cell table-column--date' onClick={togglePerspective}><VisibilityOutlined /> Date</div>
        {people.values.map(person => (
          <div key={person.id} className='table-cell table-column--age'>{person.name}</div>
        ))}
        <div className='table-cell table-column--total'>Total (£)</div>
        <div className='table-cell table-column--total'>Total (£)</div>
        {accounts.values.map(account => (
          <div
            key={account.id}
            className='table-cell table-column--account-balance'
            onClick={() => dialogs.editAccount(account)}
          >
            {account.description}
          </div>
        ))}
      </div>
    </div>
  )
})

function TableRowWrapper({ index, ...rest }: RowProps) {
  // Index 0 is the header which is rendered separately
  return index === 0 ? null : <TableRow index={index - 1} {...rest} />
}

const TableBody = forwardRef<HTMLDivElement, React.PropsWithChildren<unknown>>(function TableBody({ children, ...rest }, ref) {
  return (
    <div ref={ref} {...rest}>
      <TableHeader />
      {children}
    </div>
  )
})

const getItemSize = (index: number) => index === 0 ? 84 : 24
const getKey: ListItemKeySelector<Dates> = (index, dates) => index === 0 ? '__HEADER__' : dates[index - 1]

const Table = observer(function Table({ height, width }: { height: number, width: number }) {
  const { visibleDates, showAges, showPerspective } = useStore()

  return (
    <VariableSizeList
      className={classNames('table', {
        'hide-ages': !showAges,
        'table__show-perspective': showPerspective
      })}
      height={height}
      width={width}
      itemCount={visibleDates.length + 1} // +1 for header row
      itemData={visibleDates}
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