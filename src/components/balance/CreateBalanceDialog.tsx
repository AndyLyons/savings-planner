import { useSelector } from '../../state/app';
import { CreateOrEditBalance } from './CreateOrEditBalance';

interface Props {
  onClose: () => void
}

export function CreateBalanceDialog({ onClose }: Props) {
  const createBalance = useSelector((state) => state.createBalance)

  return (
    <CreateOrEditBalance action='Create' onClose={onClose} onDone={createBalance} />
  )
}