import { Route, Routes } from 'react-router-dom';
import { Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSelector } from '../../state/app';
import { ListItemButtonLink, Title } from '../mui';
import { useIsDesktop } from '../../utils/breakpoints';
import { CreatePersonDialog } from './CreatePersonDialog';
import { EditPersonDialog } from './EditPersonDialog';
import { PersonListItem } from './PersonListItem';

export function People() {
  const isDesktop = useIsDesktop()
  const peopleIds = useSelector(state => state.peopleIds, [])

  return (
    <Box>
      <Title>People</Title>
      <List dense={isDesktop}>
        {peopleIds.map(id => (
          <PersonListItem key={id} id={id} />
        ))}
        {peopleIds.length > 0 && <Divider />}
        <ListItem>
          <ListItemButtonLink to='add'>
            <ListItemIcon><Add /></ListItemIcon>
            <ListItemText>Add a person</ListItemText>
          </ListItemButtonLink>
        </ListItem>
      </List>
      <Routes>
        <Route path='add' element={<CreatePersonDialog />} />
        <Route path=':personId' element={<EditPersonDialog />} />
      </Routes>
    </Box>
  )
}