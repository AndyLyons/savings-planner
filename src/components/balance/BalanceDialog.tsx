import { AccountBalance, CurrencyPound, Event } from '@mui/icons-material';
import { useBindSelector, useSelector } from '../../state/app';
import { BalanceId, BalanceUpdate } from '../../state/slices/balances';
import { fromYYYYMM } from '../../utils/date';
import { createEntityDialog } from '../entity/createEntityDialog';

const BalanceDialog = createEntityDialog<BalanceUpdate>('balance', <CurrencyPound />, [
  {
    type: 'selectSearch',
    name: 'account',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => {
      const accountIds = useSelector(state => state.accountsIds)
      const accounts = useSelector(state => state.accounts)
      const people = useSelector(state => state.people)
      return accountIds.map(id => {
        const { name, owner } = accounts[id]
        return ({ id, label: `${name} (${people[owner].name})` })
      })
    },
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

export function CreateBalance({ onClose }: CreateProps) {
  const createBalance = useSelector(state => state.createBalance)

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
}

interface EditProps {
  id: BalanceId
  onClose: () => void
}

export function EditBalance({ id, onClose }: EditProps) {
  const editBalance = useBindSelector(state => state.editBalance, id)
  const { account, value, date } = useSelector(state => state.balances[id], [id])

  return (
    <BalanceDialog
      initialValues={{
        account,
        value,
        date: fromYYYYMM(date)
      }}
      onClose={onClose}
      onDone={editBalance}
    />
  )
}