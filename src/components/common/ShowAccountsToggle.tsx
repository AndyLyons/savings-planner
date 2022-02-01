import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ComponentProps } from 'react';
import { useSelectorShallow } from '../../state/app';

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export function ShowAccountsToggle({ sx }: Props) {
  const [showAccounts, toggleShowAccounts] = useSelectorShallow(state => [state.showAccounts, state.toggleShowAccounts] as const)

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={toggleShowAccounts}
      size='small'
      sx={sx}
      value={showAccounts}
    >
      <ToggleButton value={true}>Accounts</ToggleButton>
    </ToggleButtonGroup>
  )
}