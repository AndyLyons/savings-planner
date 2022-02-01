import { AccountBalance } from '@mui/icons-material';
import {
  ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material';
import { useSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { useStopEvent } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';

interface Props {
    id: AccountId
}

export function AccountListItem({ id }: Props) {
  const { name, owner, growth } = useSelector(state => state.accounts[id], [id])
  const { name: ownerName } = useSelector(state => state.people[owner], [owner])

  const navigateToEditAccount = useStopEvent(useNavigateTo(id))

  return (
    <>
      <ListItemButton onClick={navigateToEditAccount} sx={{ pl: 4, justifyContent: 'flex-start' }}>
        <ListItemIcon>
          <AccountBalance />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              <Typography sx={{ fontWeight: 'bold' }} component='span'>{name}</Typography>
              {' '}
              <Typography component='span'>({ownerName}) - {growth}%</Typography>
            </>
          }
        />
      </ListItemButton>
    </>
  )
}