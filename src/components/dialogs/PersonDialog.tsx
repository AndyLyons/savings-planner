import { Event, ShortText } from '@mui/icons-material'
import { Person, PersonIcon, PersonJSON } from '../../state/Person'
import { createDialog } from './createDialog'

export const PersonDialog = createDialog<PersonJSON>('person', <PersonIcon />, {
  id: {
    type: 'generate',
    generate: () => Person.createId()
  },
  name: {
    autoFocus: true,
    label: 'Name',
    icon: <ShortText />,
    required: true,
    type: 'string'
  },
  dob: {
    label: 'Year of birth',
    icon: <Event />,
    required: true,
    type: 'yyyy'
  }
})