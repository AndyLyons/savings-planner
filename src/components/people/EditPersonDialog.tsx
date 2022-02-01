import { useParams } from 'react-router-dom';
import { useBindSelector } from '../../state/app';
import { PersonId, useIsPersonId } from '../../state/slices/people';
import { CreateOrEditPerson } from './CreateOrEditPerson';

interface Props {
    id: PersonId
}

function ValidEditPersonDialog({ id }: Props) {
  const editPerson = useBindSelector(state => state.editPerson, id)

  return (
    <CreateOrEditPerson
      action='Edit'
      id={id}
      onDone={editPerson}
    />
  )
}

export function EditPersonDialog() {
  const { personId } = useParams()
  const isPerson = useIsPersonId(personId)

  return (
    // Specify key here to wipe the dialogs state when the id changes
    <>{isPerson && <ValidEditPersonDialog key={personId} id={personId} />}</>
  )
}