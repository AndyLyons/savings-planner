import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const ShowMonthsToggle = observer(function ShowMonthsToggle({ sx }: Props) {
  const { showMonths, toggleShowMonths } = useStore()

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={toggleShowMonths}
      size='small'
      sx={sx}
      value={showMonths}
    >
      <ToggleButton value={true}>Months</ToggleButton>
    </ToggleButtonGroup>
  )
})