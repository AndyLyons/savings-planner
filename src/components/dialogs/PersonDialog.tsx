import { Event, ShortText } from '@mui/icons-material'
import { PersonIcon, PersonSnapshotIn } from '../../state/Person'
import { createDialog } from './createDialog'

export const PersonDialog = createDialog<PersonSnapshotIn>('person', <PersonIcon />, {
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
    type: 'yyyymm'
  }
})