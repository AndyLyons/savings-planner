import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ComponentProps } from 'react';
import { useSelectorShallow } from '../../state/app';

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export function ShowAgesToggle({ sx }: Props) {
  const [showAges, toggleShowAges] = useSelectorShallow(state => [state.showAges, state.toggleShowAges] as const)

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
}