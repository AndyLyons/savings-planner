import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const ShowAgesToggle = observer(function ShowAgesToggle({ sx }: Props) {
  const { showAges, toggleShowAges } = useStore()

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={toggleShowAges}
      size='small'
      sx={sx}
      value={showAges}
    >
      <ToggleButton value={true}>Ages</ToggleButton>
    </ToggleButtonGroup>
  )
})