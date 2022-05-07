import { Add, Edit, SwapHoriz } from '@mui/icons-material'
import { Box, Button, SvgIcon, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef, useMemo } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ListChildComponentProps, ListItemKeySelector } from 'react-window'
import { VariableSizeList  } from 'react-window'
import type { Account, AccountId } from '../../state/Account'
import type { PersonId } from '../../state/Person'
import { subYear, YYYY } from '../../utils/date'
import { useAction, useStore } from '../../utils/mobx'

type Dates = Array<YYYY>

const formatter = new Intl.NumberFormat()
const formatNumber = (value: number) => formatter.format(Math.floor(value))

const AgeCell = observer(function AgeCell({ year, personId }: { year: YYYY, personId: PersonId }) {
  const age = useStore(store => store.people.get(personId).getAge(year))
  return <div className='table-cell table-column--age'>{age}</div>
})

const AddIcon = <Add sx={{ fontSize: 'inherit !important' }} />
const EditIcon = <Edit sx={{ fontSize: 'inherit !important' }} />

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

const getActionIcon = (account: Account, year: YYYY) => {
  const hasDeposit = account.getDeposits(year) !== 0
  const hasWithdrawal = account.getWithdrawals(year) !== 0

  if (hasDeposit && hasWithdrawal) {
    return <SwapHoriz />
  }

  if (hasDeposit) {
    return <ArrowRight />
  }

  if (hasWithdrawal) {
    return <ArrowLeft />
  }

  return null
}

const KnownBalance = observer(function KnownBalance({ account, year }: { account: Account, year: YYYY }) {
  const balance = account.balances.get(year)
  const predictedBalance = account.getCalculatedBalance(year)
  const isUp = balance.value > predictedBalance
  const isDown = balance.value < predictedBalance

  const editBalance = useAction(store => {
    store.dialogs.editBalance(balance)
  }, [balance])

  return (
    <Button
      className={classNames('table-column--account_edit-balance', {
        'table-column--account_edit-balance--up': isUp,
        'table-column--account_edit-balance--down': isDown
      })}
      onClick={editBalance}
      startIcon={getActionIcon(account, year)}
      endIcon={EditIcon}
      size='small'
      variant='contained'
    >
      {formatNumber(balance.value)}
    </Button>
  )
})

const PredictedBalance = observer(function PredictedBalance({ account, year }: { account: Account, year: YYYY }) {
  const balanceValue = account.getBalance(year)

  const createBalance = useAction((store) => {
    store.dialogs.createBalance(account, { year })
  }, [year, account])

  return (
    <Button
      className="table-column--account_add-balance"
      onClick={createBalance}
      startIcon={getActionIcon(account, year)}
      endIcon={AddIcon}
      size='small'
      variant='contained'
    >
      {balanceValue ? formatNumber(balanceValue) : ''}
    </Button>
  )
})

const AccountBreakdown = observer(function AccountBreakdown({ year, accountId }: { year: YYYY, accountId: AccountId }) {
  const account = useStore(store => store.accounts.get(accountId))
  const previous = account.getBalance(subYear(year))
  const interest = account.getInterest(year)
  const deposits = account.getDeposits(year)
  const withdrawals = account.getWithdrawals(year)
  const calculatedBalance = account.getCalculatedBalance(year)

  return (
    <ul className='account-breakdown'>
      <li className='account-breakdown--existing'>£{formatNumber(previous)}</li>
      <li className='account-breakdown--add'>£{formatNumber(deposits)} deposits</li>
      <li className='account-breakdown--add'>£{formatNumber(interest)} interest</li>
      <li className='account-breakdown--subtract'>£{formatNumber(withdrawals)} withdrawals</li>
      <li className='account-breakdown--total'>£{formatNumber(calculatedBalance)}</li>
    </ul>
  )
})

const AccountBalanceCell = observer(function AccountBalanceCell({ year, accountId }: { year: YYYY, accountId: AccountId }) {
  const account = useStore(store => store.accounts.get(accountId))
  const hasConcreteBalance = account.balances.has(year)

  return (
    <Tooltip
      disableInteractive
      placement='bottom'
      title={<AccountBreakdown year={year} accountId={accountId} />}
    >
      <div className='table-cell table-column--account-balance'>
        {
          hasConcreteBalance
            ? <KnownBalance account={account} year={year} />
            : <PredictedBalance account={account} year={year} />
        }
      </div>
    </Tooltip>
  )
})

const TotalBalanceCell = observer(function TotalBalanceCell({ year }: { year: YYYY }) {
  const store = useStore()
  const balances = store.accounts.values.map(account => {
    const balance = account.balances.get(year)?.value
    return balance ?? account.getBalance(year)
  })

  const total = balances.reduce((sum, value) => sum + value, 0)

  return (
    <div className='table-cell table-column--total'>{total ? formatNumber(total) : ''}</div>
  )
})

const AccountIncomeCell = observer(function AccountIncomeCell({ year, accountId }: { year: YYYY, accountId: AccountId }) {
  const account = useStore(store => store.accounts.get(accountId))
  const income = account.getWithdrawals(year)

  return (
    <div className='table-cell table-column--account-income'>{income ? formatNumber(income) : ''}</div>
  )
})

const TotalIncomeCell = observer(function TotalIncomeCell({ year }: { year: YYYY }) {
  const store = useStore()
  const withdrawals = store.accounts.values.map(account =>
    account.getWithdrawals(year)
  )

  const total = withdrawals.reduce((sum, value) => sum + value, 0)

  return (
    <div className='table-cell table-column--total'>{total ? formatNumber(total) : ''}</div>
  )
})

type RowProps = ListChildComponentProps<Dates>

const TableRow = observer(function TableRow(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people } = useStore()

  const year = data[index - 2] // -2 because of header rows

  return (
    <div className='table-row' style={style}>
      <div className='table-cell table-column--year'>{year}</div>
      {people.keys.map(personId => (
        <AgeCell key={personId} year={year} personId={personId} />
      ))}
      <TotalIncomeCell year={year} />
      {accounts.keys.map(accountId => (
        <AccountIncomeCell key={accountId} year={year} accountId={accountId} />
      ))}
      <TotalBalanceCell year={year} />
      {accounts.keys.map(accountId => (
        <AccountBalanceCell key={accountId} year={year} accountId={accountId} />
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
    <>
      <div className="table-header">
        <div className="table-row table-row--groups">
          <div className='table-cell--empty table-column--year'></div>
          {people.keys.map(personId => (
            <div key={personId} className='table-cell--empty table-column--age'></div>
          ))}
          <Box className='table-cell table-columns--incomes' sx={sxIncomes}>Income</Box>
          <Box className='table-cell table-columns--balances' sx={sxBalances}>Balance</Box>
        </div>
        <div className="table-row table-row--headers">
          <div className='table-cell table-column--year'>Date</div>
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
    </>
  )
})

const TableRowWrapper = function TableRowWrapper(props: RowProps) {
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
  const { years, showIncomes, showAges } = useStore()

  return (
    <VariableSizeList
      className={classNames('table', {
        'hide-ages': !showAges,
        'hide-incomes': !showIncomes
      })}
      height={height}
      width={width}
      itemCount={years.length + 2} // +2 for header rows
      itemData={years}
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