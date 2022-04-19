import { Add, Edit } from '@mui/icons-material'
import { Box, Button, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { format } from 'date-fns'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ListChildComponentProps, ListItemKeySelector } from 'react-window'
import { FixedSizeList } from 'react-window'
import type { AccountId } from '../../state/Account'
import type { Balance } from '../../state/Balance'
import type { PersonId } from '../../state/Person'
import { Period } from '../../state/Store'
import type { YYYYMM } from '../../utils/date'
import { fromYYYYMM } from '../../utils/date'
import { useBind } from '../../utils/hooks'
import { useStore, useUI } from '../../utils/mobx'
import { getButtonColour, getDirection } from './utils'

type Dates = Array<YYYYMM>

const formatMonthYear = (period: Period, date: YYYYMM) => format(fromYYYYMM(date), period === Period.MONTH ? 'MMM yyyy' : 'yyyy')

const AgeCell = observer(function AgeCell({ date, personId }: { date: YYYYMM, personId: PersonId }) {
  const age = useStore(store => store.people.getPerson(personId).getAge(date))
  return <div className='table-cell table-column--age'>{age}</div>
})

const AddIcon = <Add sx={{ fontSize: 'inherit !important' }} />
const EditIcon = <Edit sx={{ fontSize: 'inherit !important' }} />

function BalanceButton({ balance, interpolated }: { balance: Balance, interpolated: number | undefined }) {
  const ui = useUI()
  const editBalance = useBind(ui.editBalance, balance)

  const direction = getDirection(balance.value, interpolated)
  const buttonColour = getButtonColour(direction)

  return (
    <Tooltip placement='right' title={interpolated?.toFixed(0) ?? ''}>
      <Button
        className="table-column--account_edit-balance"
        color={buttonColour}
        onClick={editBalance}
        endIcon={EditIcon}
        size='small'
        variant='contained'
      >
        {balance.value.toFixed(0)}
      </Button>
    </Tooltip>
  )
}

function InterpolatedButton({ account, date, interpolated }: { account: AccountId, date: YYYYMM, interpolated: number | undefined }) {
  const ui = useUI()

  const createBalance = useCallback(() => {
    ui.createBalanceFrom({ date, account })
  }, [ui, date, account])

  return (
    <Button
      className="table-column--account_add-balance"
      onClick={createBalance}
      endIcon={AddIcon}
      size='small'
      variant='contained'
    >{interpolated?.toFixed(0)}</Button>
  )
}

const AccountBalanceCell = observer(function AccountBalanceCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const store = useStore()
  const account = store.accounts.getAccount(accountId)
  const balance = account.balances.getBalance(date)
  const interpolated = account.balances.interpolateBalance(date)

  return (
    <div className='table-cell table-column--account-balance'>
      {balance && <BalanceButton balance={balance} interpolated={interpolated} />}
      {!balance && <InterpolatedButton account={accountId} date={date} interpolated={interpolated} />}
    </div>
  )
})

const TotalBalanceCell = observer(function TotalBalanceCell({ date }: { date: YYYYMM }) {
  const store = useStore()
  const balances = store.accounts.values.map(account => {
    const balance = account.balances.getBalance(date)?.value
    return balance ?? account.balances.interpolateBalance(date)
  })

  const total = balances.reduce((sum, value) => (
    value !== undefined ? (sum ?? 0) + value : sum
  ), undefined)

  return (
    <div className='table-cell table-column--total'>{total?.toFixed(0)}</div>
  )
})

type RowProps = ListChildComponentProps<Dates>

const TableRow = observer(function TableRow(props: RowProps) {
  const { data, index, style } = props
  const { accounts, people, period } = useStore()

  const date = data[index - 2] // -2 because of header rows

  return (
    <div className='table-row' style={style}>
      <div className='table-cell table-column--date'>{formatMonthYear(period, date)}</div>
      {people.keys.map(personId => (
        <AgeCell key={personId} date={date} personId={personId} />
      ))}
      <div className='table-cell table-column--total' />
      {accounts.keys.map(accountId => (
        <div key={accountId} className='table-cell table-column--account-income' />
      ))}
      <TotalBalanceCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountBalanceCell key={accountId} date={date} accountId={accountId} />
      ))}
    </div>
  )
})

const TableHeader = observer(function TableHeader() {
  const { people, accounts, showAccounts } = useStore()
  const numVisibleAccounts = showAccounts ? accounts.keys.length : 0

  return (
    <>
      <div className="table-header">
        <div className="table-row">
          <div className='table-cell--empty table-column--date'></div>
          {people.keys.map(personId => (
            <div key={personId} className='table-cell--empty table-column--age'></div>
          ))}
          <Box className='table-cell table-columns--incomes' sx={{ width: `${150 + (numVisibleAccounts * 150)}px` }}>Income</Box>
          <Box className='table-cell table-columns--balances' sx={{ width: `${150 + (numVisibleAccounts * 150)}px` }}>Balance</Box>
        </div>
        <div className="table-row">
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

const getKey: ListItemKeySelector<Dates> = (index, dates) => index === 0 ? '__HEADER__' : dates[index - 1]

const Table = observer(function Table({ height, width }: { height: number, width: number }) {
  const { dates, showAccounts, showAges } = useStore()

  return (
    <FixedSizeList
      className={classNames('table', { 'hide-ages': !showAges, 'hide-accounts': !showAccounts })}
      height={height}
      width={width}
      itemCount={dates.length + 2} // +2 for header rows
      itemData={dates}
      innerElementType={TableBody}
      itemKey={getKey}
      itemSize={42}
    >
      {TableRowWrapper}
    </FixedSizeList>
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