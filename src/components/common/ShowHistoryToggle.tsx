import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ComponentProps } from 'react';
import { useSelectorShallow } from '../../state/app';

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export function ShowHistoryToggle({ sx }: Props) {
  const [showHistory, toggleShowHistory] = useSelectorShallow(state => [state.showHistory, state.toggleShowHistory] as const)

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
}