import { Box, List, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Account } from '../../state/Account'
import { useIsDesktop } from '../../utils/breakpoints'
import { useStore } from '../../utils/mobx'
import { AccountListItem } from './AccountListItem'

interface Props {
  onClick: (account: Account) => void
}

export const Accounts = observer(function Accounts({ onClick }: Props) {
  const isDesktop = useIsDesktop()
  const accounts = useStore(store => store.accounts.values)

  return (
    <Box>
      <Typography variant='h6' component='h2'>Accounts</Typography>
      {accounts.length === 0 && <Typography sx={{ ml: 1, mt: 1 }}>No accounts yet</Typography>}
      <List dense={isDesktop}>
        {accounts.map(account => (
          <AccountListItem key={account.id} account={account} onClick={onClick} />
        ))}
      </List>
    </Box>
  )
})