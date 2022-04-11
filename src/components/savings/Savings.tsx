import { CurrencyPound, Edit } from '@mui/icons-material'
import {
  Box, Breadcrumbs, Button, Paper, SpeedDialAction, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import classNames from 'classnames'
import { differenceInYears, format } from 'date-fns'
import { observer } from 'mobx-react-lite'
import { ComponentProps, Fragment, useState } from 'react'
import { getSavingsTable } from '../../selectors/savings'
import { Balance } from '../../state/Balance'
import { Period } from '../../state/Store'
import { toYYYYMM } from '../../utils/date'
import { useBind, useBoolean } from '../../utils/hooks'
import { useComputed, useStore } from '../../utils/mobx'
import { CreateBalance, EditBalance } from '../balance/BalanceDialog'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import { SpeedDial } from '../mui/SpeedDial'
import './Savings.css'

const formatMonthYear = (date: Date) => format(date, 'MMM yyyy')
const getAgeAtDate = (dob: Date, date: Date) => differenceInYears(date, dob)

// Empty cell which takes up all remaining space, causing other cells to
// compress to the minimum width needed to fit their contents
function SpacerCell() {
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

export const Savings = observer(function Savings() {
  const [isAddingBalance, openAddBalance, closeAddBalance] = useBoolean(false)
  const [editingBalance, setEditingBalance] = useState<Balance>()
  const closeEditBalance = useBind(setEditingBalance, undefined)

  const store = useStore()
  const { period, showAges } = store

  const savingsTable = useComputed(getSavingsTable, [])

  return (
    <Paper className='screen-savings' sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Balances</Typography>
      </Breadcrumbs>
      <SpeedDial ariaLabel='savings-actions'>
        <SpeedDialAction
          icon={<CurrencyPound />}
          onClick={openAddBalance}
          tooltipTitle='Balance'
        />
      </SpeedDial>
      {isAddingBalance && (
        <CreateBalance onClose={closeAddBalance} />
      )}
      {editingBalance && (
        <EditBalance balance={editingBalance} onClose={closeEditBalance} />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', rowGap: 2, mb: 1, mt: 1 }}>
        <PeriodToggle sx={{ mr: 2 }} />
        <ShowAgesToggle sx={{ mr: 2 }} />
      </Box>
      <TableContainer>
        <Table stickyHeader size='small' sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell className='column-period' sx={{ left: 0, zIndex: 3 }}>
                Period
              </TableCell>
              {showAges && store.people.values.map((person, i) =>
                <TableCell className={classNames('column-age', { 'column-age-last': i === store.people.values.length - 1 })} key={person.id}>
                  {person.name}
                </TableCell>
              )}
              <TableCell className='column-total' colSpan={2}>
                Total (£)
              </TableCell>
              {store.accounts.values.map(account =>
                <TableCell className='column-account' colSpan={2} key={account.id}>
                  {account.name} ({account.owner.name})
                </TableCell>
              )}
              <SpacerCell />
            </TableRow>
          </TableHead>
          <TableBody className={classNames({
            'period-month': period === Period.MONTH,
            'period-year': period === Period.YEAR,
            'hide-ages': !showAges
          })}>
            {savingsTable.map(row => (
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
                {row.accounts.map(({ id, balance, predicted }) =>
                  <Fragment key={id}>
                    <TableCell className={classNames('column-account column-balance', { 'has-balance': !!balance })} sx={getCellTextColour(balance?.value, predicted)}>
                      {balance && <Button color={getButtonColour(balance.value, predicted)} onClick={() => setEditingBalance(balance)} endIcon={<Edit sx={{ fontSize: 'inherit !important' }} />} size='small' variant='outlined'>{balance.value.toFixed(2)}</Button>}
                    </TableCell>
                    <TableCell className='column-account column-predicted' sx={COLOUR.GRAY}>
                      {predicted?.toFixed(2)}
                    </TableCell>
                  </Fragment>
                )}
                <SpacerCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
})