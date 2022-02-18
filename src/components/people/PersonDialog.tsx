import { Event, Person, ShortText } from '@mui/icons-material'
import { useBindSelector, useSelector } from '../../state/app'
import { PersonId, PersonUpdate } from '../../state/slices/people'
import { fromYYYYMMDD } from '../../utils/date'
import { createEntityDialog } from '../entity/createEntityDialog'

const PersonDialog = createEntityDialog<PersonUpdate>('person', <Person />, [
  {
    type: 'string',
    name: 'name',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  {
    type: 'yyyymmdd',
    name: 'dob',
    label: 'Date of birth',
    icon: <Event />,
    required: true
  }
])

interface CreateProps {
  onClose: () => void
}

export function CreatePerson({ onClose }: CreateProps) {
  const createPerson = useSelector(state => state.createPerson)

  return (
    <PersonDialog
      initialValues={{
        name: '',
        dob: null,
      }}
      onClose={onClose}
      onDone={createPerson}
    />
  )
}

interface EditProps {
  id: PersonId,
  onClose: () => void
}

export function EditPerson({ id, onClose }: EditProps) {
  const editPerson = useBindSelector(state => state.editPerson, id)
  const removePerson = useBindSelector(state => state.removePerson, id)
  const person = useSelector(state => state.people[id], [id])

  return (
    <PersonDialog initialValues={{ ...person, dob: fromYYYYMMDD(person.dob) }} onClose={onClose} onDelete={removePerson} onDone={editPerson} />
  )
}
