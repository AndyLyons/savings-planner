import { AccountBalance } from '@mui/icons-material'
import {
  ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Account } from '../../state/Account'
import { useBind } from '../../utils/hooks'

interface Props {
    account: Account,
    onClick: (account: Account) => void
}

export const AccountListItem = observer(function AccountListItem({ account, onClick }: Props) {
  const onClickAccount = useBind(onClick, account)

  return (
    <ListItemButton onClick={onClickAccount} sx={{ pl: 4, justifyContent: 'flex-start' }}>
      <ListItemIcon>
        <AccountBalance />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            <Typography sx={{ fontWeight: 'bold' }} component='span'>{account.description}</Typography>
            {' - '}
            <Typography component='span'>{account.growth === null ? 'Market growth' : `${account.ratePercentage}%`}</Typography>
          </>
        }
      />
    </ListItemButton>
  )
})