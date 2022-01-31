import { Delete } from '@mui/icons-material';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useAction, useSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { useStopPropagation } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';

interface Props {
    id: AccountId
}

export function AccountListItem({ id }: Props) {
  const { name, owner, growth } = useSelector(state => state.accounts[id], [id])
  const { name: ownerName } = useSelector(state => state.people[owner], [owner])
  const [isDeleting, setIsDeleting] = useState(false)

  const removeAccount = useStopPropagation(useAction(state => state.removeAccount, id))
  const navigateToEditAccount = useStopPropagation(useNavigateTo(id))
  const startDelete = useStopPropagation(useCallback(() => setIsDeleting(true), []))
  const cancelDelete = useCallback(() => setIsDeleting(false), [])

  return (
    <>
      <ListItemButton onClick={navigateToEditAccount} sx={{ pl: 4, justifyContent: 'flex-start' }}>
        <ListItemText
          primary={
            <>
              <Typography sx={{ fontWeight: 'bold' }} component='span'>{name}</Typography>
              {' '}
              <Typography component='span'>({ownerName}) - {growth}%</Typography>
            </>
          }
        />
        <ListItemIcon>
          <IconButton onClick={startDelete}><Delete /></IconButton>
        </ListItemIcon>
      </ListItemButton>
      <Dialog open={isDeleting} onClose={cancelDelete}>
        <DialogTitle>Delete {name} - {ownerName}?</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={removeAccount}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}