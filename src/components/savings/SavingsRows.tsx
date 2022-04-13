import { Edit } from '@mui/icons-material';
import { Button, TableCell, TableRow } from '@mui/material';
import classNames from 'classnames';
import { differenceInYears, format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { ComponentProps, useCallback } from 'react';
import { AccountData, getSavingsTable, SavingsRow } from '../../selectors/savings';
import { useIsDesktop } from '../../utils/breakpoints';
import { toYYYYMM, YYYYMM } from '../../utils/date';
import { useComputed, useUI } from '../../utils/mobx';

// Empty cell which takes up all remaining space, causing other cells to
// compress to the minimum width needed to fit their contents
export function SpacerCell() {
  return <TableCell sx={{ p: 0 }} width='100%' />
}

function StickyCell(props: ComponentProps<typeof TableCell>) {
  return (
    <TableCell
      {...props}
      sx={{
        backgroundClip: 'padding-box',
        backgroundColor: 'white',
        left: 0,
        position: 'sticky',
        zIndex: 1,
        ...props.sx
      }}
    />
  )
}

const COLOUR = {
  NONE: {},
  RED: { color: 'red' },
  GREEN: { color: 'green' },
  GRAY: { color: 'gray' }
}

const getDirection = (balance: number | undefined, predicted: number | undefined) => {
  return balance && predicted ? balance >= predicted : null
}

const getCellTextColour = (balance: number | undefined, predicted: number | undefined) => {
  const direction = getDirection(balance, predicted)
  if (direction === null) {
    return COLOUR.NONE
  }

  return direction ? COLOUR.GREEN : COLOUR.RED
}

const getButtonColour = (balance: number | undefined, predicted: number | undefined) => {
  const direction = getDirection(balance, predicted)
  if (direction === null) {
    return 'primary'
  }

  return direction ? 'success' : 'error'
}

const formatMonthYear = (date: Date) => format(date, 'MMM yyyy')
const getAgeAtDate = (dob: Date, date: Date) => differenceInYears(date, dob)

const AccountCells = observer(function AccountCells({ account, date }: { account: AccountData, date: YYYYMM }) {
  const ui = useUI()
  const isDesktop = useIsDesktop()
  const { id, balance, predicted } = account

  const editBalance = useCallback(() => {
    if (balance) {
      ui.editBalance(balance)
    }
  }, [ui, balance])

  const createBalance = useCallback(() => {
    ui.createBalanceFrom({ date, account: id })
  }, [ui, date, id])

  return (
    <>
      <TableCell className={classNames('column-account column-balance', { 'has-balance': !!balance })} sx={getCellTextColour(balance?.value, predicted)}>
        {balance && (
          <Button
            color={getButtonColour(balance.value, predicted)}
            onClick={editBalance}
            endIcon={<Edit sx={{ fontSize: 'inherit !important' }} />}
            size='small'
            variant='outlined'
          >
            {balance.value.toFixed(2)}
          </Button>
        )}
        {!balance && isDesktop && (
          <Button
            className="add-balance"
            onClick={createBalance}
            size='small'
            variant='outlined'
          >+</Button>
        )}
      </TableCell>
      <TableCell className='column-account column-predicted' sx={COLOUR.GRAY}>
        {predicted?.toFixed(2)}
      </TableCell>
    </>
  )
})

const SavingRow = observer(function SavingRow({ row }: { row: SavingsRow }) {

  return (
    <TableRow key={toYYYYMM(row.date)} className={row.date.getMonth() === 0 ? 'row-jan' : 'row-not-jan'}>
      <StickyCell className='column-period'>
        {formatMonthYear(row.date)}
      </StickyCell>
      {row.ages.map(({ id, dob }, i) =>
        <TableCell key={id} className={classNames('column-age', { 'column-age-last': i === row.ages.length - 1 })} >
          {getAgeAtDate(dob, row.date)}
        </TableCell>
      )}
      <TableCell className='column-total column-balance' sx={getCellTextColour(row.totalBalance, row.totalPredicted)}>
        {row.totalBalance?.toFixed(2)}
      </TableCell>
      <TableCell className='column-total column-predicted' sx={COLOUR.GRAY}>
        {row.totalPredicted?.toFixed(2)}
      </TableCell>
      {row.accounts.map(account =>
        <AccountCells account={account} date={toYYYYMM(row.date)} key={account.id} />
      )}
      <SpacerCell />
    </TableRow>
  )
})

export const SavingsRows = observer(function SavingsRows() {
  const savingsTable = useComputed(getSavingsTable, [])

  return <>
    {savingsTable.map(row => (
      <SavingRow key={toYYYYMM(row.date)} row={row} />
    ))}
  </>
})