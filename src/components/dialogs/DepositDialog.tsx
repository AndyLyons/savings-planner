import { AccountBalance, CurrencyPound, Event, EventRepeat, Loop } from '@mui/icons-material'
import { Deposit, DepositIcon, DepositJSON, RETIREMENT, START } from '../../state/Deposit'
import { Period } from '../../utils/date'
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
  period: {
    type: 'string',
    label: 'Per',
    icon: <EventRepeat />,
    useOptions: () => [{ id: Period.MONTH, label: 'Month' }, { id: Period.YEAR, label: 'Year' }],
    required: true
  },
  startYear: {
    type: 'yyyy',
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
  endYear: {
    type: 'yyyy',
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
  period: Period.MONTH,
  repeating: true,
  startYear: START
})