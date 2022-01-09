import { useParams } from 'react-router-dom';
import { PersonId, useAction, useIsPersonId, useSelector } from '../../state/app';
import { CreateOrEditDialog } from './CreateOrEditDialog';

interface Props {
    id: PersonId
}

function EditPersonDialog({ id }: Props) {
  const person = useSelector(state => state.people[id], [id])
  const editPerson = useAction(state => state.editPerson, id)

  return (
    <CreateOrEditDialog title='Edit person' initialName={person.name} initialDob={person.dob} onDone={editPerson} />
  )
}

export function EditPersonDialogOrError() {
  const { personId } = useParams()
  const isPerson = useIsPersonId(personId)

  return (
    isPerson
    // Specify key here to wipe the dialogs state when the id changes
      ? <EditPersonDialog key={personId} id={personId} />
      : <div>Oops! Something went wrong</div>
  )
}