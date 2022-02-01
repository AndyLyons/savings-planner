import { Box, Breadcrumbs, Paper, Typography } from '@mui/material'
import { PeriodToggle } from '../common/PeriodToggle'
import { ShowAgesToggle } from '../common/ShowAgesToggle'

export function Savings() {
  return (
    <Paper sx={{ p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Savings</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <ShowAgesToggle />
        <PeriodToggle />
      </Box>
    </Paper>
  )
}