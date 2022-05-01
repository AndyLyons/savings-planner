import { AccountBalance, CurrencyPound, Event, EventRepeat, Loop, Percent, RadioButtonChecked } from '@mui/icons-material'
import { Period } from '../../state/Store'
import { RETIREMENT, Withdrawal, WithdrawalIcon, WithdrawalJSON, WithdrawalType } from '../../state/Withdrawal'
import { useStore } from '../../utils/mobx'
import { createDialog } from './createDialog'

export const WithdrawalDialog = createDialog<WithdrawalJSON>('withdrawal schedule', <WithdrawalIcon />, {
  id: {
    type: 'generate',
    generate: () => Withdrawal.createId()
  },
  account: {
    autoFocus: true,
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, name, owner }) => ({ id, label: `${name} (${owner.name})` }))),
    readonly: true,
    required: true
  },
  type: {
    type: 'string',
    label: 'Type',
    icon: <RadioButtonChecked />,
    useOptions: () => [
      { id: WithdrawalType.FIXED, label: '£ amount' },
      { id: WithdrawalType.PERCENTAGE, label: '% of value' },
    ],
    required: true
  },
  amount: {
    type: 'number',
    label: 'Amount',
    icon: <CurrencyPound />,
    required: true
  },
  taxRate: {
    type: 'number',
    label: 'Tax rate',
    icon: <Percent />,
    required: true
  },
  startDate: {
    type: 'yyyymm',
    label: 'On',
    icon: <Event />,
    required: true,
    useConstantOption: () => {
      const { retireOn } = useStore()
      return { label: 'Retirement', value: RETIREMENT, constantValue: retireOn }
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
    required: true
  }
}, {
  type: WithdrawalType.FIXED,
  taxRate: 0
})