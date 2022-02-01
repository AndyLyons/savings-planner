import { Person } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useSelector } from '../../state/app';
import { PersonId } from '../../state/slices/people';
import { formatYYYYMMDD } from '../../utils/date';
import { useBind } from '../../utils/hooks';

interface Props {
    id: PersonId
    onClick: (id: PersonId) => void
}

export function PersonListItem({ id, onClick }: Props) {
  const { name, dob } = useSelector(state => state.people[id], [id])
  const onClickWithId = useBind(onClick, id)

  return (
    <ListItemButton onClick={onClickWithId} sx={{ pl: 4 }}>
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