import { Box, List, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Person } from '../../state/Person'
import { useIsDesktop } from '../../utils/breakpoints'
import { useStore } from '../../utils/mobx'
import { PersonListItem } from './PersonListItem'

interface Props {
  onClick: (person: Person) => void
}

export const People = observer(function People({ onClick }: Props) {
  const isDesktop = useIsDesktop()
  const people = useStore(store => store.people.values)

  return (
    <Box>
      <Typography variant='h6' component='h2'>People</Typography>
      {people.length === 0 && <Typography sx={{ ml: 1, mt: 1 }}>No people yet</Typography>}
      <List dense={isDesktop}>
        {people.map(person => (
          <PersonListItem key={person.id} person={person} onClick={onClick} />
        ))}
      </List>
    </Box>
  )
})