import { Add, Edit } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
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
import type { YYYYMM } from '../../utils/date'
import { fromYYYYMM } from '../../utils/date'
import { useBind } from '../../utils/hooks'
import { useStore, useUI } from '../../utils/mobx'
import { getButtonColour, getDirection } from './utils'

type Dates = Array<YYYYMM>

const formatMonthYear = (date: YYYYMM) => format(fromYYYYMM(date), 'MMM yyyy')

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

const AccountCell = observer(function AccountCell({ date, accountId }: { date: YYYYMM, accountId: AccountId }) {
  const store = useStore()
  const account = store.accounts.getAccount(accountId)
  const balance = account.balances.getBalance(date)
  const interpolated = account.balances.interpolateBalance(date)

  return (
    <div className='table-cell table-column--account'>
      {balance && <BalanceButton balance={balance} interpolated={interpolated} />}
      {!balance && <InterpolatedButton account={accountId} date={date} interpolated={interpolated} />}
    </div>
  )
})

const TotalCell = observer(function TotalCell({ date }: { date: YYYYMM }) {
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
  const { people, accounts } = useStore()

  const date = data[index - 1] // -1 because of header row

  return (
    <div className='table-row' style={style}>
      <div className='table-cell table-column--date'>{formatMonthYear(date)}</div>
      {people.keys.map(personId => (
        <AgeCell key={personId} date={date} personId={personId} />
      ))}
      <TotalCell date={date} />
      {accounts.keys.map(accountId => (
        <AccountCell key={accountId} date={date} accountId={accountId} />
      ))}
    </div>
  )
})

const TableHeader = observer(function TableHeader() {
  const { people, accounts } = useStore()

  return (
    <div className="table-header table-row">
      <div className='table-cell table-column--date'>Date</div>
      {people.values.map(person => (
        <div key={person.id} className='table-cell table-column--age'>{person.name}</div>
      ))}
      <div className='table-cell table-column--total'>Total (£)</div>
      {accounts.values.map(account => (
        <div key={account.id} className='table-cell table-column--account'>{account.name} ({account.owner.name})</div>
      ))}
    </div>
  )
})

const TableRowWrapper = function TableRowWrapper(props: RowProps) {
  // Index 0 is the header which is rendered separately
  return props.index === 0 ? null : <TableRow {...props} />
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
  const { dates, showAges } = useStore()

  return (
    <FixedSizeList
      className={classNames('table', { 'hide-ages': !showAges })}
      height={height}
      width={width}
      itemCount={dates.length + 1} // +1 for header row
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