import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const ShowIncomesToggle = observer(function ShowIncomesToggle({ sx }: Props) {
  const { showIncomes, toggleShowIncomes } = useStore()

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={toggleShowIncomes}
      size='small'
      sx={sx}
      value={showIncomes}
    >
      <ToggleButton value={true}>Incomes</ToggleButton>
    </ToggleButtonGroup>
  )
})