import { List, ShortText } from '@mui/icons-material'
import { Deposit, DepositIcon } from '../../state/Deposit'
import { DialogType } from '../../state/Dialogs'
import { Strategy, StrategyIcon, StrategyJSON } from '../../state/Strategy'
import { Withdrawal, WithdrawalIcon } from '../../state/Withdrawal'
import { createDialog } from './createDialog'

export const StrategyDialog = createDialog<StrategyJSON>('strategy', <StrategyIcon />, {
  id: {
    type: 'generate',
    generate: () => Strategy.createId()
  },
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
    getKey: (store, deposit) => deposit.id,
    getLabel: (store, deposit) => {
      const account = store.accounts.get(deposit.account)
      return `${account.description} - ${Deposit.getDescription(deposit)}`
    }
  },
  withdrawals: {
    type: 'collection',
    dialogType: DialogType.WITHDRAWAL,
    label: 'Withdrawals',
    icon: <List />,
    itemIcon: <WithdrawalIcon />,
    getKey: (store, withdrawal) => withdrawal.id,
    getLabel: (store, withdrawal) => {
      const account = store.accounts.get(withdrawal.account)
      return `${account.description} - ${Withdrawal.getDescription(withdrawal)}`
    }
  }
}, {
  deposits: [],
  withdrawals: []
})