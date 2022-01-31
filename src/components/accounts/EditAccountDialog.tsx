import { useParams } from 'react-router-dom';
import { useAction, useSelector } from '../../state/app';
import { AccountId, useIsAccountId } from '../../state/slices/accounts';
import { CreateOrEditAccount } from './CreateOrEditAccount';

interface Props {
    id: AccountId
}

function ValidEditAccountDialog({ id }: Props) {
  const account = useSelector(state => state.accounts[id], [id])
  const editAccount = useAction(state => state.editAccount, id)

  return (
    <CreateOrEditAccount
      action='Edit'
      initialAccount={account}
      onDone={editAccount}
    />
  )
}

export function EditAccountDialog() {
  const { accountId } = useParams()
  const isAccount = useIsAccountId(accountId)

  return (
    isAccount
    // Specify key here to wipe the dialogs state when the id changes
      ? <ValidEditAccountDialog key={accountId} id={accountId} />
      : <div>Oops! Something went wrong</div>
  )
}