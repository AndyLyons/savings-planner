import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const ShowAccountsToggle = observer(function ShowAccountsToggle({ sx }: Props) {
  const { showAccounts, toggleShowAccounts } = useStore()

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
})