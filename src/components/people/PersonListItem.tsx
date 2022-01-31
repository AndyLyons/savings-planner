import { Delete, Edit, Person } from '@mui/icons-material';
import { IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAction, useSelector } from '../../state/app';
import { PersonId } from '../../state/slices/people';
import { formatYYYYMMDD } from '../../utils/date';
import { useStopPropagation } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';

interface Props {
    id: PersonId
}

export function PersonListItem({ id }: Props) {
  const { name, dob } = useSelector(state => state.people[id], [id])

  const removePerson = useStopPropagation(useAction(state => state.removePerson, id))
  const navigateToPerson = useStopPropagation(useNavigateTo(id))

  return (
    <ListItem sx={{ pl: 4 }}>
      <ListItemIcon>
        <Person />
      </ListItemIcon>
      <ListItemText primary={name} secondary={`DOB: ${formatYYYYMMDD(dob)}`} />
      <ListItemIcon>
        <IconButton onClick={navigateToPerson}><Edit /></IconButton>
      </ListItemIcon>
      <ListItemIcon>
        <IconButton onClick={removePerson}><Delete /></IconButton>
      </ListItemIcon>
    </ListItem>
  )
}