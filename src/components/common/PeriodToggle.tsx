import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ComponentProps, useCallback } from 'react';
import { Period, useSelectorShallow } from '../../state/app';

interface Props {
  sx?: ComponentProps<typeof ToggleButtonGroup>['sx']
}

export function PeriodToggle({ sx }: Props) {
  const [period, setPeriod] = useSelectorShallow(state => [state.period, state.setPeriod] as const)
  const onPeriodToggle = useCallback((_: unknown, value: Period | null) => {
    if (value) {
      setPeriod(value)
    }
  }, [setPeriod])

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
}