import { AccessTime, List, Percent, Person, ShortText } from '@mui/icons-material'
import { Account, AccountIcon, AccountJSON } from '../../state/Account'
import { BalanceIcon } from '../../state/Balance'
import { DialogType } from '../../state/Dialogs'
import { Period } from '../../utils/date'
import { useStore } from '../../utils/mobx'
import { createDialog } from './createDialog'

export const AccountDialog = createDialog<AccountJSON>('account', <AccountIcon />, {
  id: {
    type: 'generate',
    generate: () => Account.createId()
  },
  name: {
    autoFocus: true,
    type: 'string',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  owner: {
    type: 'string',
    label: 'Owner',
    icon: <Person />,
    useOptions: () => useStore(store => store.people.values.map(({ id, name }) => ({ id, label: name }))),
    required: true
  },
  growth: {
    type: 'number',
    label: 'Growth rate',
    icon: <Percent />,
    required: true,
    useConstantOption: () => {
      const constantValue = useStore(store => store.globalGrowth)
      return { label: 'Use market growth?', constantValue, value: null }
    }
  },
  compoundPeriod: {
    type: 'string',
    label: 'Compounds',
    icon: <AccessTime />,
    useOptions: () => [{ id: Period.MONTH, label: 'Monthly' }, { id: Period.YEAR, label: 'Yearly' }],
    required: true
  },
  balances: {
    type: 'collection',
    dialogType: DialogType.BALANCE,
    label: 'Balances',
    getKey: (store, balance) => `${balance.date}`,
    getLabel: (store, balance) => `${balance.date} - £${balance.value}`,
    icon: <List />,
    itemIcon: <BalanceIcon />
  },
}, {
  balances: [],
  growth: null,
  compoundPeriod: Period.YEAR
})