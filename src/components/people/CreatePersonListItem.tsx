import { useSelector } from '../../state/app';
import { CreateOrEditListItem } from './CreateOrEditListItem';

export function CreatePersonListItem() {
  const createPerson = useSelector((state) => state.createPerson)

  return (
    <CreateOrEditListItem onDone={createPerson} />
  )
}