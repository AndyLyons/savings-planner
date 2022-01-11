import { Route, Routes } from 'react-router-dom';
import {
  Box, Breadcrumbs, Divider, List, ListItem,
  ListItemIcon, ListItemText, Typography
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { ListItemButtonLink } from '../mui';
import { useSelector } from '../../state/app';
import { useIsDesktop } from '../../utils/breakpoints';
import { CreateAccountDialog } from './CreateAccountDialog';
import { EditAccountDialog } from './EditAccountDialog';
import { AccountListItem } from './AccountListItem';

export function Accounts() {
  const isDesktop = useIsDesktop()
  const accounts = useSelector(state => state.accountsIds)

  return (
    <Box>
      <Breadcrumbs>
        <Typography variant='h6' component='h2'>Accounts</Typography>
      </Breadcrumbs>
      <List dense={isDesktop}>
        {accounts.map(id => (
          <AccountListItem key={id} id={id} />
        ))}
        {accounts.length > 0 && <Divider />}
        <ListItem>
          <ListItemButtonLink to='add'>
            <ListItemIcon><Add /></ListItemIcon>
            <ListItemText>Add an account</ListItemText>
          </ListItemButtonLink>
        </ListItem>
      </List>
      <Routes>
        <Route path='add' element={<CreateAccountDialog />} />
        <Route path=':accountId' element={<EditAccountDialog />} />
      </Routes>
    </Box>
  )
}