import { AccountBalance } from '@mui/icons-material';
import {
  ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material';
import { useSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { useBind } from '../../utils/hooks';

interface Props {
    id: AccountId,
    onClick: (id: AccountId) => void
}

export function AccountListItem({ id, onClick }: Props) {
  const { name, owner, growth } = useSelector(state => state.accounts[id], [id])
  const { name: ownerName } = useSelector(state => state.people[owner], [owner])
  const onClickWithId = useBind(onClick, id)


  return (
    <>
      <ListItemButton onClick={onClickWithId} sx={{ pl: 4, justifyContent: 'flex-start' }}>
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