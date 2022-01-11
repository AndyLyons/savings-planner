import { IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useAction, useSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { useNavigateTo } from '../../utils/router';

interface Props {
    id: AccountId
}

export function AccountListItem({ id }: Props) {
  const { name, owner } = useSelector(state => state.accounts[id], [id])
  const { name: ownerName } = useSelector(state => state.people[owner], [owner])

  const removeAccount = useAction(state => state.removeAccount, id)

  const navigateToEditAccount = useNavigateTo(id)
  const navigateToAccount = useNavigateTo(`/account/${id}`)

  return (
    <ListItemButton onClick={navigateToAccount} sx={{ pl: 4 }}>
      <ListItemText primary={name} secondary={ownerName} />
      <ListItemIcon>
        <IconButton onClick={navigateToEditAccount}><Edit /></IconButton>
      </ListItemIcon>
      <ListItemIcon>
        <IconButton onClick={removeAccount}><Delete /></IconButton>
      </ListItemIcon>
    </ListItemButton>
  )
}