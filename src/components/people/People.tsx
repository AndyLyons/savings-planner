import { Route, Routes } from 'react-router-dom';
import { Box, Divider, List } from '@mui/material';
import { useSelector } from '../../state/app';
import { Title } from '../mui/Title';
import { CreatePersonDialog } from './CreatePersonDialog';
import { EditPersonDialogOrError } from './EditPersonDialog';
import { PersonListItem } from './PersonListItem';
import { FooterListItem } from './FooterListItem';

export function People() {
  const peopleIds = useSelector(state => state.peopleIds, [])

  return (
    <Box>
      <Title>People</Title>
      <List>
        {peopleIds.map(id => (
          <PersonListItem key={id} id={id} />
        ))}
      </List>
      {peopleIds.length > 0 && <Divider />}
      <FooterListItem />
      <Routes>
        <Route path='add' element={<CreatePersonDialog />} />
        <Route path=':personId' element={<EditPersonDialogOrError />} />
      </Routes>
    </Box>
  )
}