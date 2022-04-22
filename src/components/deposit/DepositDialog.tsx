import { AccountBalance, CurrencyPound, Download, Event, EventRepeat, Loop, ViewList } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { Deposit, DepositJSON, RETIREMENT } from '../../state/Deposit'
import { Period } from '../../state/Store'
import type { StrategyId } from '../../state/Strategy'
import { useAction, useStore } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

type DepositData = DepositJSON & {
  strategy: StrategyId
}

const DepositDialog = createEntityDialog<DepositData>('deposit', <Download />, {
  strategy: {
    type: 'string',
    label: 'Strategy',
    icon: <ViewList />,
    useOptions: () => useStore(store => store.strategies.values.map(({ id, name }) => ({ id, label: name }))),
    readonly: true,
    required: true
  },
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
    label: 'Deposit',
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
    getVisible: (state) => state.repeating === true,
    required: true
  },
  endDate: {
    type: 'yyyymm',
    label: 'Until',
    icon: <Event />,
    getVisible: (state) => state.repeating === true,
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
  const createDeposit = useAction((store, { strategy: strategyId, account: accountId, ...details }: DepositData) => {
    const strategy = store.strategies.getStrategy(strategyId)
    const account = store.accounts.getAccount(accountId)
    strategy.addDeposit(Deposit.create(store, strategy, { account, ...details }))
  }, [])

  return (
    <DepositDialog
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
    deposit.amount = details.amount
    deposit.startDate = details.startDate
    deposit.repeating = details.repeating
    deposit.endDate = details.endDate
    deposit.period = details.period
    deposit.account = store.accounts.getAccount(details.account)
  }, [deposit])

  const onDelete = useAction(() => {
    deposit.strategy.removeDeposit(deposit)
  }, [deposit])

  return (
    <DepositDialog
      initialValues={{ ...deposit.toJSON(), strategy: deposit.strategy.id }}
      onClose={onClose}
      onDelete={onDelete}
      onDone={onEdit}
    />
  )
})