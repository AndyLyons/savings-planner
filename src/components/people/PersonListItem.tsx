import { Person as PersonIcon } from '@mui/icons-material'
import { ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { Person } from '../../state/Person'
import { formatYYYYMMDD } from '../../utils/date'
import { useBind } from '../../utils/hooks'

interface Props {
    person: Person
    onClick: (person: Person) => void
}

export const PersonListItem = observer(function PersonListItem({ person, onClick }: Props) {
  const onClickWithId = useBind(onClick, person)

  return (
    <ListItemButton onClick={onClickWithId} sx={{ pl: 4 }}>
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            <Typography sx={{ fontWeight: 'bold' }} component='span'>{person.name}</Typography>
            <Typography component='span'> - {formatYYYYMMDD(person.dob)}</Typography>
          </>
        }
      />
    </ListItemButton>
  )
})