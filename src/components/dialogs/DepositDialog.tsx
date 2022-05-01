import { AccountBalance, CurrencyPound, Event, EventRepeat, Loop } from '@mui/icons-material'
import { Deposit, DepositIcon, DepositJSON, RETIREMENT, START } from '../../state/Deposit'
import { Period } from '../../state/Store'
import { useStore } from '../../utils/mobx'
import { createDialog } from './createDialog'

export const DepositDialog = createDialog<DepositJSON>('deposit schedule', <DepositIcon />, {
  id: {
    type: 'generate',
    generate: () => Deposit.createId()
  },
  account: {
    autoFocus: true,
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, name, owner }) => ({ id, label: `${name} (${owner.name})` }))),
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
    label: 'On',
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
  period: {
    type: 'string',
    label: 'Every',
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
}, {
  startDate: START
})