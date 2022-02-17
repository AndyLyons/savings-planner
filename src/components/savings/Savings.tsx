import { CurrencyPound } from '@mui/icons-material'
import {
  Box, Breadcrumbs, Paper, SpeedDialAction, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import { ComponentProps } from 'react'
import { getSavingsTable } from '../../selectors/savings'
import { Period, useSelector, useStore } from '../../state/app'
import { useBoolean } from '../../utils/hooks'
import { CreateBalance } from '../balance/BalanceDialog'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAccountsToggle } from '../common/ShowAccountsToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import { ShowHistoryToggle } from '../common/ShowHistoryToggle'
import { SpeedDial } from '../mui/SpeedDial'

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
          <TableBody>
            {savingsTable.map(row =>
              (period === Period.MONTH || row.month === 'Jan') && (
                <TableRow>
                  <StickyCell>{period === Period.MONTH ? `${row.month} ${row.year}` : row.year}</StickyCell>
                  {showAges && row.ages.map(({ id, age }) =>
                    <TableCell key={id}>{age}</TableCell>
                  )}
                  <TableCell>£{row.balance}</TableCell>
                  {showAccounts && row.accounts.map(({ id, balance }) =>
                    <TableCell key={id}>£{balance}</TableCell>
                  )}
                  <SpacerCell />
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}