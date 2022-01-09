import { Container, Paper, SxProps, Theme, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    sx?: SxProps<Theme>
}>

export function Body({ children, sx }: Props) {
  return (
    <Container maxWidth='lg' sx={sx}>
      <Toolbar />
      <Paper sx={{ m: 2, p: 2 }}>
        {children}
      </Paper>
    </Container>
  )
}