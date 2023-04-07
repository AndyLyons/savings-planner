import { List, ShortText } from '@mui/icons-material'
import { Deposit, DepositIcon } from '../../state/Deposit'
import { DialogType } from '../../state/Dialogs'
import { StrategyIcon, StrategySnapshotIn } from '../../state/Strategy'
import { Withdrawal, WithdrawalIcon } from '../../state/Withdrawal'
import { createDialog } from './createDialog'

export const StrategyDialog = createDialog<StrategySnapshotIn>('strategy', <StrategyIcon />, {
  name: {
    autoFocus: true,
    type: 'string',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  deposits: {
    type: 'collection',
    dialogType: DialogType.DEPOSIT,
    label: 'Deposits',
    icon: <List />,
    itemIcon: <DepositIcon />,
    getLabel: (store, deposit) => {
      const account = store.accounts.get(deposit.accountId)
      return `${account.description} - ${Deposit.getDescription(deposit)}`
    }
  },
  withdrawals: {
    type: 'collection',
    dialogType: DialogType.WITHDRAWAL,
    label: 'Withdrawals',
    icon: <List />,
    itemIcon: <WithdrawalIcon />,
    getLabel: (store, withdrawal) => {
      const account = store.accounts.get(withdrawal.accountId)
      return `${account.description} - ${Withdrawal.getDescription(withdrawal)}`
    }
  }
}, {
  deposits: [],
  withdrawals: []
})