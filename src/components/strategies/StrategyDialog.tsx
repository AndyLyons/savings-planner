import { Download, List, ShortText } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import type { Strategy, StrategyDetails } from '../../state/Strategy'
import { useAction, useUI } from '../../utils/mobx'
import { createEntityDialog } from '../entity/createEntityDialog'

type StrategyData = StrategyDetails

const StrategyDialog = createEntityDialog<StrategyData>('strategy', <Download />, {
  name: {
    type: 'string',
    label: 'Name',
    icon: <ShortText />,
    required: true
  },
  deposits: {
    type: 'list',
    label: 'Deposits',
    icon: <List />,
    itemIcon: <Download />,
    getKey: deposit => deposit.id,
    getLabel: deposit => `${deposit.account.name} £${deposit.amount}`,
    useOnEdit: () => useUI(ui => ui.editDeposit),
    useOnCreate: () => useUI(ui => ui.createDeposit)
  }
})

interface CreateProps {
  initialValues?: Partial<StrategyData>
  onClose: () => void
}

const DEFAULT = {}

export const CreateStrategy = observer(function CreateStrategy({ initialValues = DEFAULT, onClose }: CreateProps) {
  const createStrategy = useAction((store, details: StrategyData) => {
    store.strategies.createStrategy(details)
  }, [])

  return (
    <StrategyDialog
      initialValues={initialValues}
      onClose={onClose}
      onDone={createStrategy}
    />
  )
})

interface EditProps {
  strategy: Strategy
  onClose: () => void
}

export const EditStrategy = observer(function EditStrategy({ strategy, onClose }: EditProps) {
  const onEdit = useAction((store, details: StrategyData) => {
    strategy.name = details.name
  }, [strategy])

  const onDelete = useAction((store) => {
    store.strategies.removeStrategy(strategy)
  }, [strategy])

  return (
    <StrategyDialog
      initialValues={strategy}
      onClose={onClose}
      onDelete={onDelete}
      onDone={onEdit}
    />
  )
})