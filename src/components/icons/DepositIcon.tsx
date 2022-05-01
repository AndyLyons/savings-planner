import { Login } from '@mui/icons-material';
import type { ComponentProps } from 'react';

export function DepositIcon(props: ComponentProps<typeof Login>) {
  return <Login {...props} sx={{ ...props.sx, transform: 'rotate(90deg)' }} />
}