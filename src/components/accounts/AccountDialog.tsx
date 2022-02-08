import { AccountBalance, Percent, Person, ShortText } from '@mui/icons-material';
import { useBindSelector, useSelector } from '../../state/app';
import { Account, AccountId } from '../../state/slices/accounts';
import { createEntityDialog } from '../entity/createEntityDialog';

const AccountDialog = createEntityDialog<Account>('account', <AccountBalance />, [
  {
    type: 'string',
    name: 'name',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  {
    type: 'selectSearch',
    name: 'owner',
    label: 'Owner',
    icon: <Person />,
    useOptions: () => {
      const peopleIds = useSelector(state => state.peopleIds)
      const people = useSelector(state => state.people)
      return peopleIds.map(id => ({ id, label: people[id].name }))
    },
    required: true
  },
  {
    type: 'number',
    name: 'growth',
    label: 'Growth rate',
    icon: <Percent />,
    required: true
  }
])

interface CreateProps {
  onClose: () => void
}

export function CreateAccount({ onClose }: CreateProps) {
  const createAccount = useSelector(state => state.createAccount)

  return (
    <AccountDialog
      initialValues={{
        name: '',
        owner: '',
        growth: 0
      }}
      onClose={onClose}
      onDone={createAccount}
    />
  )
}

interface EditProps {
  id: AccountId,
  onClose: () => void
}

export function EditAccount({ id, onClose }: EditProps) {
  const editAccount = useBindSelector(state => state.editAccount, id)
  const removeAccount = useBindSelector(state => state.removeAccount, id)
  const account = useSelector(state => state.accounts[id], [id])

  return (
    <AccountDialog initialValues={account} onClose={onClose} onDelete={removeAccount} onDone={editAccount} />
  )
}
