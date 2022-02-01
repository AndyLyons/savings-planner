import {
  Box, List, Typography
} from '@mui/material';
import { useSelector } from '../../state/app';
import { PersonId } from '../../state/slices/people';
import { useIsDesktop } from '../../utils/breakpoints';
import { PersonListItem } from './PersonListItem';

interface Props {
  onClick: (id: PersonId) => void
}

export function People({ onClick }: Props) {
  const isDesktop = useIsDesktop()
  const peopleIds = useSelector(state => state.peopleIds, [])

  return (
    <Box>
      <Typography variant='h6' component='h2'>People</Typography>
      {peopleIds.length === 0 && <Typography sx={{ ml: 1, mt: 1 }}>No people yet</Typography>}
      <List dense={isDesktop}>
        {peopleIds.map(id => (
          <PersonListItem key={id} id={id} onClick={onClick} />
        ))}
      </List>
    </Box>
  )
}