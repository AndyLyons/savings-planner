import {
  Box, Breadcrumbs, Paper, SxProps, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Theme, Typography
} from '@mui/material'
import { Period, useSelector } from '../../state/app'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAccountsToggle } from '../common/ShowAccountsToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'

// Empty cell which takes up all remaining space, causing other cells to
// compress to the minimum width needed to fit their contents
function Spacer() {
  return <TableCell sx={{ p: 0 }} width='100%' />
}

const STICKY_COLUMN: SxProps<Theme> = {
  backgroundClip: 'padding-box',
  backgroundColor: 'white',
  left: 0,
  position: 'sticky'
}

export function Incomes() {
  const period = useSelector(state => state.period)
  const showAges = useSelector(state => state.showAges)
  const showAccounts = useSelector(state => state.showAccounts)
  const peopleIds = useSelector(state => state.peopleIds)
  const people = useSelector(state => state.people)
  const accountsIds = useSelector(state => state.accountsIds)
  const accounts = useSelector(state => state.accounts)

  return (
    <Paper sx={{ p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Incomes</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', rowGap: 2, mb: 1, mt: 1 }}>
        <PeriodToggle sx={{ mr: 2 }} />
        <ShowAgesToggle sx={{ mr: 2 }} />
        <ShowAccountsToggle />
      </Box>
      <TableContainer>
        <Table size='small' sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={STICKY_COLUMN}>Period</TableCell>
              {showAges && peopleIds.map(id =>
                <TableCell key={id}>{people[id].name}</TableCell>
              )}
              <TableCell>Balance</TableCell>
              {showAccounts && accountsIds.map(id =>
                <TableCell key={id}>{accounts[id].name} ({people[accounts[id].owner].name})</TableCell>
              )}
              <Spacer />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={STICKY_COLUMN}>{period === Period.MONTH && 'Jan '}2022</TableCell>
              {showAges && peopleIds.map(id =>
                <TableCell key={id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {showAccounts && accountsIds.map(id =>
                <TableCell key={id}>£10</TableCell>
              )}
              <Spacer />
            </TableRow>
            <TableRow>
              <TableCell sx={STICKY_COLUMN}>{period === Period.MONTH && 'Feb '}2022</TableCell>
              {showAges && peopleIds.map(id =>
                <TableCell key={id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {showAccounts && accountsIds.map(id =>
                <TableCell key={id}>£10</TableCell>
              )}
              <Spacer />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}