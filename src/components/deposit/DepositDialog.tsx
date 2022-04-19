import { AccountBalance, CurrencyPound, Download, Event, EventRepeat, Loop } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { Period } from '../../state/Store'
import { Deposit, DepositJSON, RETIREMENT } from '../../state/Deposit'
import { useAction, useStore } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

type DepositData = DepositJSON & {
  repeating: boolean
}

const DespoitDialog = createEntityDialog<DepositData>('deposit', <Download />, {
  account: {
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, name, owner }) => ({ id, label: `${name} (${owner.name})` }))),
    readonly: true,
    required: true
  },
  amount: {
    type: 'number',
    label: 'Despoit',
    icon: <CurrencyPound />,
    required: true
  },
  startDate: {
    type: 'yyyymm',
    label: 'From',
    icon: <Event />,
    required: true
  },
  repeating: {
    type: 'boolean',
    label: 'Repeating',
    icon: <Loop />,
    required: false
  },
  period: {
    type: 'string',
    label: 'Every...',
    icon: <EventRepeat />,
    useOptions: () => [{ id: Period.MONTH, label: 'Month' }, { id: Period.YEAR, label: 'Year' }],
    getEnabled: (state) => state.repeating === true,
    required: true
  },
  endDate: {
    type: 'yyyymm',
    label: 'Until',
    icon: <Event />,
    getEnabled: (state) => state.repeating === true,
    required: true,
    useConstantOption: () => {
      const { retireOn } = useStore()
      return { label: 'Retirement', value: RETIREMENT, constantValue: retireOn }
    }
  }
})

interface CreateProps {
  initialValues?: Partial<DepositJSON>
  onClose: () => void
}

const DEFAULT = {}

export const CreateDeposit = observer(function CreateDeposit({ initialValues = DEFAULT, onClose }: CreateProps) {
  const createDeposit = useAction((store, details: DepositData) => {
    console.log('Create', details);

    // const account = store.accounts.getAccount(accountId)
    // account.deposits.createDeposit(details)
  }, [])

  return (
    <DespoitDialog
      initialValues={initialValues}
      onClose={onClose}
      onDone={createDeposit}
    />
  )
})

interface EditProps {
  deposit: Deposit
  onClose: () => void
}

export const EditDeposit = observer(function EditDeposit({ deposit, onClose }: EditProps) {
  const onEdit = useAction((store, details: DepositData) => {
    // deposit.value = details.value
    // deposit.date = details.date
    console.log('Edit', details);
  }, [deposit])

  const onDelete = useAction(() => {
    console.log('Delete');

    // deposit.account.deposits.removeDeposit(deposit)
  }, [deposit])

  return (
    <DespoitDialog
      initialValues={{}}
      onClose={onClose}
      onDelete={onDelete}
      onDone={onEdit}
    />
  )
})