import { AccountBalance, CurrencyPound, Event } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { AccountId } from '../../state/Account'
import type { Balance, BalanceJSON } from '../../state/Balance'
import { useAction, useStore } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

type BalanceData = BalanceJSON & {
  account: AccountId
}

const BalanceDialog = createEntityDialog<BalanceData>('balance', <CurrencyPound />, {
  account: {
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, name, owner }) => ({ id, label: `${name} (${owner.name})` }))),
    readonly: true,
    required: true
  },
  value: {
    type: 'number',
    label: 'Balance',
    icon: <CurrencyPound />,
    required: true
  },
  date: {
    type: 'yyyymm',
    label: 'Date',
    icon: <Event />,
    required: true
  }
})

interface CreateProps {
  initialValues?: Partial<BalanceJSON>
  onClose: () => void
}

const DEFAULT = { value: 0 }

export const CreateBalance = observer(function CreateBalance({ initialValues = DEFAULT, onClose }: CreateProps) {
  const createBalance = useAction((store, { account: accountId, ...details }: BalanceData) => {
    const account = store.accounts.getAccount(accountId)
    account.balances.createBalance(details)
  }, [])

  return (
    <BalanceDialog
      initialValues={initialValues}
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
  const onEdit = useAction((store, details: BalanceData) => {
    balance.value = details.value
    balance.date = details.date
  }, [balance])

  const onDelete = useAction(() => {
    balance.account.balances.removeBalance(balance)
  }, [balance])

  return (
    <BalanceDialog
      initialValues={{ ...balance.toJSON(), account: balance.account.id }}
      onClose={onClose}
      onDelete={onDelete}
      onDone={onEdit}
    />
  )
})