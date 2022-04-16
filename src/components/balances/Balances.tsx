import { CurrencyPound } from '@mui/icons-material'
import {
  Box, Breadcrumbs, Paper, SpeedDialAction, Typography
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useUI } from '../../utils/mobx'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'
import { SpeedDial } from '../mui/SpeedDial'
import './Balances.css'
import { BalancesTable } from './BalancesTable'

export const Balances = observer(function Balances() {
  const ui = useUI()

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Balances</Typography>
      </Breadcrumbs>
      <SpeedDial ariaLabel='balances-actions'>
        <SpeedDialAction
          icon={<CurrencyPound />}
          onClick={ui.createBalance}
          tooltipTitle='Balance'
        />
      </SpeedDial>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 2,
        mb: 1,
        mt: 1
      }}>
        <PeriodToggle sx={{ mr: 2 }} />
        <ShowAgesToggle sx={{ mr: 2 }} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <BalancesTable />
      </Box>
    </Paper>
  )
})