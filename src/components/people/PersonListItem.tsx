import { Person } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useSelector } from '../../state/app';
import { PersonId } from '../../state/slices/people';
import { formatYYYYMMDD } from '../../utils/date';
import { useStopEvent } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';

interface Props {
    id: PersonId
}

export function PersonListItem({ id }: Props) {
  const { name, dob } = useSelector(state => state.people[id], [id])

  const navigateToPerson = useStopEvent(useNavigateTo(id))

  return (
    <ListItemButton onClick={navigateToPerson} sx={{ pl: 4 }}>
      <ListItemIcon>
        <Person />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            <Typography sx={{ fontWeight: 'bold' }} component='span'>{name}</Typography>
            <Typography component='span'> - {formatYYYYMMDD(dob)}</Typography>
          </>
        }
      />
    </ListItemButton>
  )
}