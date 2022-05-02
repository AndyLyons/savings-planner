import { AccessTime, List, Percent, Person, ShortText } from '@mui/icons-material'
import { Account, AccountIcon, AccountJSON } from '../../state/Account'
import { BalanceIcon } from '../../state/Balance'
import { DialogType } from '../../state/Dialogs'
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
    type: 'number',
    label: 'Compounds per year',
    icon: <AccessTime />,
    required: true
  },
  balances: {
    type: 'collection',
    dialogType: DialogType.BALANCE,
    label: 'Balances',
    getKey: (store, balance) => `${balance.year}`,
    getLabel: (store, balance) => `${balance.year} - £${balance.value}`,
    icon: <List />,
    itemIcon: <BalanceIcon />
  },
}, {
  balances: [],
  growth: null,
  compoundPeriod: 1
})