import { useSelector } from '../../state/app';
import { CreateOrEditPerson } from './CreateOrEditPerson';

interface Props {
  onClose: () => void
}

export function CreatePersonDialog({ onClose }: Props) {
  const createPerson = useSelector((state) => state.createPerson)

  return (
    <CreateOrEditPerson action='Create' onClose={onClose} onDone={createPerson} />
  )
}