import { ReactElement } from 'react';
import { Box, Icon, Typography } from '@mui/material';

interface Props{
  children?: string
  icon?: ReactElement
}

export function Title({ children, icon }: Props = { children: '' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {icon && <Icon color='action'>{icon}</Icon>}
      <Typography sx={{ ml: 2 }} variant='h6' component='h2'>{children}</Typography>
    </Box>
  )
}