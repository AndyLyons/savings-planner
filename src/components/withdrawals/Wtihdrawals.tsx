import {
  Box, Breadcrumbs, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import { ComponentProps } from 'react'
import { Period, useSelector } from '../../state/app'
import { ShowHistoryToggle } from '../common/ShowHistoryToggle'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAccountsToggle } from '../common/ShowAccountsToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'

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

export function Withdrawals() {
  const period = useSelector(state => state.period)
  const showAges = useSelector(state => state.showAges)
  const showAccounts = useSelector(state => state.showAccounts)
  const people = useSelector(state => state.people)
  const peopleList = Object.values(people)
  const accountsList = Object.values(useSelector(state => state.accounts))

  return (
    <Paper sx={{ p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Withdrawals</Typography>
      </Breadcrumbs>
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
              {showAges && peopleList.map(person =>
                <TableCell key={person.id}>{person.name}</TableCell>
              )}
              <TableCell>Withdrawn</TableCell>
              {showAccounts && accountsList.map(account =>
                <TableCell key={account.id}>{account.name} ({people[account.owner].name})</TableCell>
              )}
              <SpacerCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StickyCell>{period === Period.MONTH && 'Jan '}2022</StickyCell>
              {showAges && peopleList.map(person =>
                <TableCell key={person.id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {showAccounts && accountsList.map(account =>
                <TableCell key={account.id}>£10</TableCell>
              )}
              <SpacerCell />
            </TableRow>
            <TableRow>
              <StickyCell>{period === Period.MONTH && 'Feb '}2022</StickyCell>
              {showAges && peopleList.map(person =>
                <TableCell key={person.id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {showAccounts && accountsList.map(account =>
                <TableCell key={account.id}>£10</TableCell>
              )}
              <SpacerCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}