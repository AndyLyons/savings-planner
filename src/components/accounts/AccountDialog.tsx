import { AccessTime, AccountBalance, Percent, Person, ShortText } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { Account, AccountJSON } from '../../state/Account'
import { useAction, useStore } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

const AccountDialog = createEntityDialog<AccountJSON>('account', <AccountBalance />, {
  name: {
    type: 'string',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  owner: {
    type: 'string',
    label: 'Owner',
    icon: <Person />,
    useOptions: () => useStore(store => store.people.values.map(({ id, name }) => ({ id, label: name }))),
    required: true
  },
  growth: {
    type: 'number',
    label: 'Growth rate',
    icon: <Percent />,
    required: true,
    useConstantOption: () => {
      const value = useStore(store => store.globalGrowth)
      return { label: 'Use market growth?', value }
    }
  },
  compoundPeriod: {
    type: 'number',
    label: 'Compounds per year',
    icon: <AccessTime />,
    required: true
  }
})

interface CreateProps {
  onClose: () => void
}

export const CreateAccount = observer(function CreateAccount({ onClose }: CreateProps) {
  const createAccount = useAction((store, details: AccountJSON) => {
    const owner = store.people.getPerson(details.owner)
    store.accounts.addAccount({ ...details, owner })
  }, [])

  return (
    <AccountDialog
      initialValues={{
        growth: 0,
        compoundPeriod: 1
      }}
      onClose={onClose}
      onDone={createAccount}
    />
  )
})

interface EditProps {
  account: Account,
  onClose: () => void
}

export const EditAccount = observer(function EditAccount({ account, onClose }: EditProps) {
  const onEdit = useAction((store, details: AccountJSON) => {
    account.name = details.name
    account.growth = details.growth
    account.compoundPeriod = details.compoundPeriod
    account.owner = store.people.getPerson(details.owner)
  }, [account])

  const onDelete = useAction(store => {
    store.accounts.removeAccount(account)
  }, [account])

  return (
    <AccountDialog initialValues={account.toJSON()} onClose={onClose} onDelete={onDelete} onDone={onEdit} />
  )
})