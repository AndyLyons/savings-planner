import { useSelector } from '../../state/app';
import { CreateOrEditAccount } from './CreateOrEditAccount';

export function CreateAccountDialog() {
  const createAccount = useSelector((state) => state.createAccount)

  return (
    <CreateOrEditAccount action='Create' onDone={createAccount} />
  )
}