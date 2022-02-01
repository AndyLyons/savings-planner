import { useParams } from 'react-router-dom';
import { useBindSelector } from '../../state/app';
import { AccountId, useIsAccountId } from '../../state/slices/accounts';
import { CreateOrEditAccount } from './CreateOrEditAccount';

interface Props {
    id: AccountId
}

function ValidEditAccountDialog({ id }: Props) {
  const editAccount = useBindSelector(state => state.editAccount, id)

  return (
    <CreateOrEditAccount
      action='Edit'
      id={id}
      onDone={editAccount}
    />
  )
}

export function EditAccountDialog() {
  const { accountId } = useParams()
  const isAccount = useIsAccountId(accountId)

  return (
    // Specify key here to wipe the dialogs state when the id changes
    <>{isAccount && <ValidEditAccountDialog key={accountId} id={accountId} />}</>
  )
}