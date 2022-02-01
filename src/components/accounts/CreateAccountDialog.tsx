import { useSelector } from '../../state/app';
import { CreateOrEditAccount } from './CreateOrEditAccount';

interface Props {
  onClose: () => void
}

export function CreateAccountDialog({ onClose }: Props) {
  const createAccount = useSelector((state) => state.createAccount)

  return (
    <CreateOrEditAccount action='Create' onClose={onClose} onDone={createAccount} />
  )
}