import { CurrencyPound, Event } from '@mui/icons-material'
import { BalanceIcon, BalanceSnapshotIn } from '../../state/Balance'
import { createDialog } from './createDialog'

export const BalanceDialog = createDialog<BalanceSnapshotIn>('balance', <BalanceIcon />, {
  accountId: null,
  date: {
    type: 'yyyymm',
    label: 'Date',
    icon: <Event />,
    required: true
  },
  value: {
    autoFocus: true,
    type: 'number',
    label: 'Balance',
    icon: <CurrencyPound />,
    required: true
  }
})
