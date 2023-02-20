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
    type: 'string',
    label: 'Account',
    icon: <AccountBalance />,
    useOptions: () => useStore(store => store.accounts.values.map(({ id, description }) => ({ id, label: description }))),
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
      { id: WithdrawalType.TAKE_INTEREST, label: 'Take interest' },
      { id: WithdrawalType.STATIC_PERCENTAGE, label: '% of initial / year' }
    ],
    required: true
  },
  amount: {
    autoFocus: true,
    type: 'number',
    label: (state) => [WithdrawalType.PERCENTAGE, WithdrawalType.STATIC_PERCENTAGE, WithdrawalType.TAKE_INTEREST].includes(state.type) ? 'Percentage' : 'Amount',
    icon: (state) => [WithdrawalType.PERCENTAGE, WithdrawalType.STATIC_PERCENTAGE, WithdrawalType.TAKE_INTEREST].includes(state.type) ? <Percent /> :  <CurrencyPound />,
    required: state => state.type !== WithdrawalType.TAKE_INTEREST,
    getVisible: state => state.type !== WithdrawalType.TAKE_INTEREST,
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
  startDate: {
    type: 'yyyymm',
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
  endDate: {
    type: 'yyyymm',
    label: 'Until',
    icon: <Event />,
    getVisible: (state) => state.repeating === true,
    required: true
  }
}, {
  type: WithdrawalType.FIXED_PER_MONTH,
  taxRate: 0
})