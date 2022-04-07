import { Event, Person as PersonIcon, ShortText } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import type { Person, PersonJSON } from '../../state/Person'
import { useAction } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

const PersonDialog = createEntityDialog<PersonJSON>('person', <PersonIcon />, {
  name: {
    label: 'Name',
    icon: <ShortText />,
    required: true,
    type: 'string'
  },
  dob: {
    label: 'Date of birth',
    icon: <Event />,
    required: true,
    type: 'yyyymmdd'
  }
})

interface CreateProps {
  onClose: () => void
}

export const CreatePerson = observer(function CreatePerson({ onClose }: CreateProps) {
  const createPerson = useAction((store, details: PersonJSON) => {
    store.people.addPerson(details)
  }, [])

  return (
    <PersonDialog
      onClose={onClose}
      onDone={createPerson}
    />
  )
})

interface EditProps {
  person: Person,
  onClose: () => void
}

export const EditPerson = observer(function EditPerson({ person, onClose }: EditProps) {
  const onEdit = useAction((store, details: PersonJSON) => {
    person.name = details.name
    person.dob = details.dob
  }, [person])

  const onDelete = useAction(store => {
    store.people.removePerson(person)
  }, [person])

  return (
    <PersonDialog initialValues={person.toJSON()} onClose={onClose} onDelete={onDelete} onDone={onEdit} />
  )
})