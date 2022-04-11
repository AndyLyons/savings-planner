import {
  Box, Breadcrumbs, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import type { ComponentProps } from 'react'
import { Period } from '../../state/Store'
import { useStore } from '../../utils/mobx'
import { PeriodToggle } from '../common/PeriodToggle'
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
  const store = useStore()
  const { period, showAges } = store

  return (
    <Paper sx={{ p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Withdrawals</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', rowGap: 2, mb: 1, mt: 1 }}>
        <PeriodToggle sx={{ mr: 2 }} />
        <ShowAgesToggle sx={{ mr: 2 }} />
      </Box>
      <TableContainer>
        <Table size='small' sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <StickyCell>Period</StickyCell>
              {showAges && store.people.values.map(person =>
                <TableCell key={person.id}>{person.name}</TableCell>
              )}
              <TableCell>Withdrawn</TableCell>
              {store.accounts.values.map(account =>
                <TableCell key={account.id}>{account.name} ({account.owner.name})</TableCell>
              )}
              <SpacerCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StickyCell>{period === Period.MONTH && 'Jan '}2022</StickyCell>
              {showAges && store.people.values.map(person =>
                <TableCell key={person.id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {store.accounts.values.map(account =>
                <TableCell key={account.id}>£10</TableCell>
              )}
              <SpacerCell />
            </TableRow>
            <TableRow>
              <StickyCell>{period === Period.MONTH && 'Feb '}2022</StickyCell>
              {showAges && store.people.values.map(person =>
                <TableCell key={person.id}>35</TableCell>
              )}
              <TableCell>£0</TableCell>
              {store.accounts.values.map(account =>
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