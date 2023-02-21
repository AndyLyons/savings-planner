import {
  Box, Breadcrumbs, Paper, Typography
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import './Balances.css'
import { BalancesTable } from './BalancesTable'
import { ShowMonthsToggle } from '../common/ShowMonthsToggle'

export const Balances = observer(function Balances() {
  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Savings</Typography>
      </Breadcrumbs>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 2,
        mb: 1,
        mt: 1
      }}>
        <ShowMonthsToggle sx={{ mr: 2 }}  />
        <ShowAgesToggle sx={{ mr: 2 }} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <BalancesTable />
      </Box>
    </Paper>
  )
})