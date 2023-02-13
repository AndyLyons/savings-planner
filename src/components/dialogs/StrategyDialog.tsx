import { List, ShortText } from '@mui/icons-material'
import { DepositIcon } from '../../state/Deposit'
import { DialogType } from '../../state/Dialogs'
import { Strategy, StrategyIcon, StrategyJSON } from '../../state/Strategy'
import { WithdrawalIcon, WithdrawalType } from '../../state/Withdrawal'
import { Period } from '../../utils/date'
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
      return `${account.name} (${account.owner.name}) - £${deposit.amount} / ${deposit.period === Period.MONTH ? 'month' : 'year'}`
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
      const amountValue = withdrawal.amount === null ? store.globalGrowth : withdrawal.amount
      const prefix = withdrawal.type === WithdrawalType.STATIC_PERCENTAGE ? 'Fixed ' : ''
      const symbol = [WithdrawalType.PERCENTAGE, WithdrawalType.STATIC_PERCENTAGE].includes(withdrawal.type) ? '%' : '£'
      const per = withdrawal.type === WithdrawalType.FIXED_PER_MONTH ? 'month' : 'year'
      const account = store.accounts.get(withdrawal.account)
      return `${account.name} (${account.owner.name}) - ${prefix}${symbol}${amountValue} / ${per}`
    }
  }
}, {
  deposits: [],
  withdrawals: []
})