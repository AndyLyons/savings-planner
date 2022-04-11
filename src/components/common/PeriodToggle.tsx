import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type { ComponentProps } from 'react'
import { Period } from '../../state/Store'
import { useAction, useStore } from '../../utils/mobx'

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export const PeriodToggle = observer(function PeriodToggle({ sx }: Props) {
  const period = useStore(store => store.period)

  const onPeriodToggle = useAction((store, _: unknown, value: Period | null) => {
    if (value) {
      store.period = value
    }
  }, [])

  return (
    <ToggleButtonGroup
      color='primary'
      exclusive
      onChange={onPeriodToggle}
      size='small'
      sx={sx}
      value={period}
    >
      <ToggleButton value={Period.MONTH}>Monthly</ToggleButton>
      <ToggleButton value={Period.YEAR}>Yearly</ToggleButton>
    </ToggleButtonGroup>
  )
})