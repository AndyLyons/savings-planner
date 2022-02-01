import { useBindSelector } from '../../state/app';
import { AccountId } from '../../state/slices/accounts';
import { CreateOrEditAccount } from './CreateOrEditAccount';

interface Props {
    id: AccountId
    onClose: () => void
}

export function EditAccountDialog({ id, onClose }: Props) {
  const editAccount = useBindSelector(state => state.editAccount, id)

  return (
    <CreateOrEditAccount
      action='Edit'
      id={id}
      onClose={onClose}
      onDone={editAccount}
    />
  )
}