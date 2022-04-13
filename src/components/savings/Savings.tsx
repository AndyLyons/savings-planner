import { CurrencyPound } from '@mui/icons-material'
import {
  Box, Breadcrumbs, Paper, SpeedDialAction, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Period } from '../../state/Store'
import { useStore, useUI } from '../../utils/mobx'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import { SpeedDial } from '../mui/SpeedDial'
import './Savings.css'
import { SavingsRows, SpacerCell } from './SavingsRows'

export const Savings = observer(function Savings() {
  const ui = useUI()
  const store = useStore()
  const { period, showAges } = store

  return (
    <Paper className='screen-savings' sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Balances</Typography>
      </Breadcrumbs>
      <SpeedDial ariaLabel='savings-actions'>
        <SpeedDialAction
          icon={<CurrencyPound />}
          onClick={ui.createBalance}
          tooltipTitle='Balance'
        />
      </SpeedDial>
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
            <SavingsRows />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
})