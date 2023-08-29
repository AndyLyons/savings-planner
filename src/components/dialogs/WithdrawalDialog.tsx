import { AccountBalance, CurrencyPound, Event, Loop, Percent, QuestionMark, RadioButtonChecked } from '@mui/icons-material'
import { RETIREMENT, WithdrawalIcon, WithdrawalSnapshotIn, WithdrawalType } from '../../state/Withdrawal'
import { useStore } from '../../utils/mobx'
import { createDialog } from './createDialog'

export const WithdrawalDialog = createDialog<WithdrawalSnapshotIn>('withdrawal schedule', <WithdrawalIcon />, {
  parentStrategyId: null,
  accountId: {
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
      { id: WithdrawalType.EMPTY_ACCOUNT, label: 'Empty account' },
      { id: WithdrawalType.STATIC_PERCENTAGE, label: '% of initial / year' }
    ],
    required: true
  },
  amount: {
    autoFocus: true,
    type: 'number',
    label: (state) => {
      switch (state.type) {
        case WithdrawalType.PERCENTAGE:
        case WithdrawalType.STATIC_PERCENTAGE:
          return 'Percentage'
        default:
          return 'Amount'
      }
    },
    icon: (state) => {
      switch (state.type) {
        case WithdrawalType.PERCENTAGE:
        case WithdrawalType.STATIC_PERCENTAGE:
          return <Percent />
        default:
          return <CurrencyPound />
      }
    },
    required: state => ![WithdrawalType.TAKE_INTEREST, WithdrawalType.EMPTY_ACCOUNT].includes(state.type),
    getVisible: state => ![WithdrawalType.TAKE_INTEREST, WithdrawalType.EMPTY_ACCOUNT].includes(state.type),
    useConstantOption: () => {
      const constantValue = useStore(store => store.globalGrowth)
      return { label: 'Use market growth?', constantValue, value: null }
    }
  },
  taxable: {
    type: 'boolean',
    label: 'Taxable?',
    icon: <QuestionMark />,
    required: true
  },
  startDate: {
    type: 'yyyy',
    label: 'In',
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
    type: 'yyyy',
    label: 'Until',
    icon: <Event />,
    getVisible: (state) => state.repeating === true,
    required: true
  }
}, {
  type: WithdrawalType.FIXED_PER_MONTH,
  taxable: true
})