import { AccountBalance, CurrencyPound, Event, Loop, Percent, RadioButtonChecked } from '@mui/icons-material'
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
      { id: WithdrawalType.FIXED_PER_MONTH, label: '£ / month' },
      { id: WithdrawalType.FIXED_PER_YEAR, label: '£ / year' },
      { id: WithdrawalType.PERCENTAGE, label: '% / year' },
      { id: WithdrawalType.STATIC_PERCENTAGE, label: 'Fixed %' }
    ],
    required: true
  },
  amount: {
    type: 'number',
    label: (state) => [WithdrawalType.PERCENTAGE, WithdrawalType.STATIC_PERCENTAGE].includes(state.type) ? 'Percentage' : 'Amount',
    icon: (state) => [WithdrawalType.PERCENTAGE, WithdrawalType.STATIC_PERCENTAGE].includes(state.type) ? <Percent /> :  <CurrencyPound />,
    required: true,
    useConstantOption: () => {
      const constantValue = useStore(store => store.globalGrowth)
      return { label: 'Use market growth?', constantValue, value: null }
    }
  },
  taxRate: {
    type: 'number',
    label: 'Tax rate',
    icon: <Percent />,
    required: true
  },
  startYear: {
    type: 'yyyy',
    label: (state) => state.repeating ? 'From' : 'In',
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
  endYear: {
    type: 'yyyy',
    label: 'Until',
    icon: <Event />,
    getVisible: (state) => state.repeating === true,
    required: true
  }
}, {
  type: WithdrawalType.FIXED_PER_MONTH,
  taxRate: 0
})