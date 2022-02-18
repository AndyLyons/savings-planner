import classNames from 'classnames'
import { CurrencyPound } from '@mui/icons-material'
import {
  Box, Breadcrumbs, Paper, SpeedDialAction, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import { differenceInYears, format } from 'date-fns'
import { ComponentProps, useMemo } from 'react'
import { getSavingsTable } from '../../selectors/savings'
import { Period, useSelector, useStore } from '../../state/app'
import { toYYYYMM } from '../../utils/date'
import { useBoolean } from '../../utils/hooks'
import { CreateBalance } from '../balance/BalanceDialog'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAccountsToggle } from '../common/ShowAccountsToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import { ShowHistoryToggle } from '../common/ShowHistoryToggle'
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
        ...props.sx
      }}
    />
  )
}

export function Savings() {
  const [isAddingBalance, openAddBalance, closeAddBalance] = useBoolean(false)

  const period = useSelector(state => state.period)
  const showAges = useSelector(state => state.showAges)
  const showAccounts = useSelector(state => state.showAccounts)
  const peopleIds = useSelector(state => state.peopleIds)
  const people = useSelector(state => state.people)
  const accountsIds = useSelector(state => state.accountsIds)
  const accounts = useSelector(state => state.accounts)

  const savingsTable = useStore(getSavingsTable)

  const rows = useMemo(() => (
    savingsTable.map(row =>
      (
        <TableRow key={toYYYYMM(row.date)} className={row.date.getMonth() === 0 ? 'row-jan' : 'row-not-jan'}>
          <StickyCell>{formatMonthYear(row.date)}</StickyCell>
          {row.ages.map(({ id, dob }) =>
            <TableCell key={id} className='column-age'>{getAgeAtDate(dob, row.date)}</TableCell>
          )}
          <TableCell>£{row.balance}</TableCell>
          {row.accounts.map(({ id, balance }) =>
            <TableCell key={id}  className='column-account'>£{balance}</TableCell>
          )}
          <SpacerCell />
        </TableRow>
      )
    )
  ), [savingsTable])

  return (
    <Paper sx={{ p: 2 }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', rowGap: 2, mb: 1, mt: 1 }}>
        <ShowHistoryToggle sx={{ mr: 2 }} />
        <PeriodToggle sx={{ mr: 2 }} />
        <ShowAgesToggle sx={{ mr: 2 }} />
        <ShowAccountsToggle />
      </Box>
      <TableContainer>
        <Table size='small' sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <StickyCell>Period</StickyCell>
              {showAges && peopleIds.map(id =>
                <TableCell key={id}>{people[id].name}</TableCell>
              )}
              <TableCell>Balance</TableCell>
              {showAccounts && accountsIds.map(id =>
                <TableCell key={id}>{accounts[id].name} ({people[accounts[id].owner].name})</TableCell>
              )}
              <SpacerCell />
            </TableRow>
          </TableHead>
          <TableBody className={classNames({
            'period-month': period === Period.MONTH,
            'period-year': period === Period.YEAR,
            'hide-ages': !showAges,
            'hide-accounts': !showAccounts
          })}>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}