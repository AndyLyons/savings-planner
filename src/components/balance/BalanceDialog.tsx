import { AccountBalance, CurrencyPound, Event } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import type { Balance, BalanceJSON } from '../../state/Balance'
import { useAction, useStore } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

const BalanceDialog = createEntityDialog<BalanceJSON>('balance', <CurrencyPound />, [
  {
    type: 'selectSearch',
    name: 'account',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, name, owner }) => ({ id, label: `${name} (${owner.name})` }))),
    required: true
  },
  {
    type: 'number',
    name: 'value',
    label: 'Balance',
    icon: <CurrencyPound />,
    required: true
  },
  {
    type: 'yyyymm',
    name: 'date',
    label: 'Date',
    icon: <Event />,
    required: true
  }
])

interface CreateProps {
  onClose: () => void
}

export const CreateBalance = observer(function CreateBalance({ onClose }: CreateProps) {
  const createBalance = useAction((store, details: BalanceJSON) => {
    const account = store.accounts.getAccount(details.account)
    store.balances.addBalance({ ...details, account })
  }, [])

  return (
    <BalanceDialog
      initialValues={{
        account: '',
        value: 0,
        date: null
      }}
      onClose={onClose}
      onDone={createBalance}
    />
  )
})

interface EditProps {
  balance: Balance
  onClose: () => void
}

export const EditBalance = observer(function EditBalance({ balance, onClose }: EditProps) {
  const onEdit = useAction((store, details: BalanceJSON) => {
    balance.value = details.value
    balance.date = details.date
    balance.account = store.accounts.getAccount(details.account)
  }, [balance])

  const onDelete = useAction(store => {
    store.balances.removeBalance(balance)
  }, [balance])

  return (
    <BalanceDialog
      initialValues={balance.toJSON()}
      onClose={onClose}
      onDelete={onDelete}
      onDone={onEdit}
    />
  )
})