import { List, ShortText } from '@mui/icons-material'
import { DepositIcon } from '../../state/Deposit'
import { DialogType } from '../../state/Dialogs'
import { Period } from '../../state/Store'
import { Strategy, StrategyIcon, StrategyJSON } from '../../state/Strategy'
import { WithdrawalIcon } from '../../state/Withdrawal'
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
    getLabel: (store, deposit) => `${store.accounts.get(deposit.account).name} £${deposit.amount} / ${deposit.period === Period.MONTH ? 'month' : 'year'}`
  },
  withdrawals: {
    type: 'collection',
    dialogType: DialogType.WITHDRAWAL,
    label: 'Withdrawals',
    icon: <List />,
    itemIcon: <WithdrawalIcon />,
    getKey: (store, withdrawal) => withdrawal.id,
    getLabel: (store, withdrawal) =>
      `${store.accounts.get(withdrawal.account).name} £${withdrawal.amount} / ${withdrawal.period === Period.MONTH ? 'month' : 'year'}`
  }
}, {
  deposits: [],
  withdrawals: []
})