import { Breadcrumbs, Paper, Typography } from '@mui/material';

export function Home() {
  return (
    <Paper sx={{ p: 2 }}>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Home</Typography>
      </Breadcrumbs>
    </Paper>
  )
}