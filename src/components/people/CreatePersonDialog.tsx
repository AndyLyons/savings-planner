import { useSelector } from '../../state/app';
import { CreateOrEditDialog } from './CreateOrEditDialog';

export function CreatePersonDialog() {
  const createPerson = useSelector((state) => state.createPerson)

  return (
    <CreateOrEditDialog action='Create' onDone={createPerson} />
  )
}