import { PersonId, useAction, useSelector } from '../../state/app';
import { CreateOrEditListItem } from './CreateOrEditListItem';

interface Props {
    id: PersonId
}

export function EditPersonListItem({ id }: Props) {
  const person = useSelector(state => state.people[id], [id])
  const editPerson = useAction(state => state.editPerson, id)

  return (
    <CreateOrEditListItem initialName={person.name} initialDob={person.dob} onDone={editPerson} />
  )
}