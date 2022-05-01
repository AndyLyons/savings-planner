import { Logout } from '@mui/icons-material';
import type { ComponentProps } from 'react';

export function WithdrawalIcon(props: ComponentProps<typeof Logout>) {
  return <Logout {...props} sx={{ ...props.sx, transform: 'rotate(-90deg)' }} />
}