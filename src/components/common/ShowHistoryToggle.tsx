import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const ShowHistoryToggle = observer(function ShowHistoryToggle({ sx }: Props) {
  const { showHistory, toggleShowHistory } = useStore()

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={toggleShowHistory}
      size='small'
      sx={sx}
      value={showHistory}
    >
      <ToggleButton value={true}>History</ToggleButton>
    </ToggleButtonGroup>
  )
})