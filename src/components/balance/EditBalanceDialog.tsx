import { useBindSelector } from '../../state/app';
import { BalanceId } from '../../state/slices/balances';
import { CreateOrEditBalance } from './CreateOrEditBalance';

interface Props {
  id: BalanceId
  onClose: () => void
}

export function EditBalanceDialog({ id, onClose }: Props) {
  const editBalance = useBindSelector(state => state.editBalance, id)

  return (
    <CreateOrEditBalance
      action='Edit'
      id={id}
      onClose={onClose}
      onDone={editBalance}
    />
  )
}