import { AccountBalance, CurrencyPound, Event, EventRepeat, Loop, VisibilityOff } from '@mui/icons-material'
import { DepositIcon, DepositSnapshotIn, RETIREMENT, START } from '../../state/Deposit'
import { Period } from '../../utils/date'
import { useStore } from '../../utils/mobx'
import { createDialog } from './createDialog'

export const DepositDialog = createDialog<DepositSnapshotIn>('deposit schedule', <DepositIcon />, {
  parentStrategyId: null,
  accountId: {
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, description }) => ({ id, label: description }))),
    readonly: true,
    required: true
  },
  amount: {
    autoFocus: true,
    type: 'number',
    label: 'Deposit',
    icon: <CurrencyPound />,
    required: true
  },
  period: {
    type: 'string',
    label: 'Per',
    icon: <EventRepeat />,
    useOptions: () => [{ id: Period.MONTH, label: 'Month' }, { id: Period.YEAR, label: 'Year' }],
    required: true
  },
  startDate: {
    type: 'yyyy',
    label: 'In',
    icon: <Event />,
    required: true,
    useConstantOption: () => {
      const { start } = useStore()
      return { label: 'Start', value: START, constantValue: start }
    }
  },
  repeating: {
    type: 'boolean',
    label: 'Repeating',
    icon: <Loop />,
    required: false
  },
  endDate: {
    type: 'yyyy',
    label: 'Until',
    icon: <Event />,
    getVisible: (state) => state.repeating === true,
    required: false,
    useConstantOption: () => {
      const { retireOn } = useStore()
      return { label: 'Retirement', value: RETIREMENT, constantValue: retireOn }
    }
  },
  hidden: {
    type: 'boolean',
    label: 'Hidden',
    icon: <VisibilityOff />,
    required: false
  }
}, {
  period: Period.MONTH,
  repeating: true,
  startDate: START,
  hidden: false
})