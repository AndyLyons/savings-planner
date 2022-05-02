import { CurrencyPound, Event } from '@mui/icons-material'
import { BalanceIcon, BalanceJSON } from '../../state/Balance'
import { createDialog } from './createDialog'

export const BalanceDialog = createDialog<BalanceJSON>('balance', <BalanceIcon />, {
  value: {
    autoFocus: true,
    type: 'number',
    label: 'Balance',
    icon: <CurrencyPound />,
    required: true
  },
  year: {
    type: 'yyyy',
    label: 'Date',
    icon: <Event />,
    required: true
  }
})