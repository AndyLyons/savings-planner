import {
  Box, Breadcrumbs, List, Typography
} from '@mui/material';
import { useSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { useIsDesktop } from '../../utils/breakpoints';
import { AccountListItem } from './AccountListItem';

interface Props {
  onClick: (id: AccountId) => void
}

export function Accounts({ onClick }: Props) {
  const isDesktop = useIsDesktop()
  const accounts = useSelector(state => state.accountsIds)

  return (
    <Box>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Accounts</Typography>
      </Breadcrumbs>
      {accounts.length === 0 && <Typography sx={{ ml: 1, mt: 1 }}>No accounts yet</Typography>}
      <List dense={isDesktop}>
        {accounts.map(id => (
          <AccountListItem key={id} id={id} onClick={onClick} />
        ))}
      </List>
    </Box>
  )
}