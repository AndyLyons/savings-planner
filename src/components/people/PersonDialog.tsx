import { Event, Person as PersonIcon, ShortText } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import type { Person } from '../../state/Person'
import { YYYYMMDD } from '../../utils/date'
import { useAction } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

type PersonDialogValues = {
  name: string,
  dob: YYYYMMDD,
}

const PersonDialog = createEntityDialog<PersonDialogValues>('person', <PersonIcon />, [
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

export const CreatePerson = observer(function CreatePerson({ onClose }: CreateProps) {
  const createPerson = useAction((store, details: PersonDialogValues) => {
    store.people.addPerson(details)
  }, [])

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
})

interface EditProps {
  person: Person,
  onClose: () => void
}

export const EditPerson = observer(function EditPerson({ person, onClose }: EditProps) {
  const onEdit = useAction((store, details: PersonDialogValues) => {
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