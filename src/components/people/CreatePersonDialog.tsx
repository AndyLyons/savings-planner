import { useSelector } from '../../state/app';
import { CreateOrEditPerson } from './CreateOrEditPerson';

export function CreatePersonDialog() {
  const createPerson = useSelector((state) => state.createPerson)

  return (
    <CreateOrEditPerson action='Create' onDone={createPerson} />
  )
}