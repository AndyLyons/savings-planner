import { useBindSelector } from '../../state/app';
import { PersonId } from '../../state/slices/people';
import { CreateOrEditPerson } from './CreateOrEditPerson';

interface Props {
    id: PersonId
    onClose: () => void
}

export function EditPersonDialog({ id, onClose }: Props) {
  const editPerson = useBindSelector(state => state.editPerson, id)

  return (
    <CreateOrEditPerson
      action='Edit'
      id={id}
      onClose={onClose}
      onDone={editPerson}
    />
  )
}