import { Close, Menu, TrendingUp } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  AppBar, Hidden, Icon, IconButton,
  SxProps, TextField, Theme,
  ThemeProvider, Toolbar, Typography
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { fromYYYY, isDate, toYYYY } from '../utils/date';
import type { ChangeEvent } from '../utils/hooks';
import { getTargetValue, useDebounceCallback } from '../utils/hooks';
import { useAction, useStore } from '../utils/mobx';
import { useNavigateTo } from '../utils/router';
import { SelectField } from './mui';
import { darkTheme } from './theme';

interface Props {
  sx?: SxProps<Theme>
}

export const Header = observer(function Header({ sx }: Props) {
  const navigateHome = useNavigateTo('/')

  const store = useStore()

  const [growth, setGrowth] = useState({
    value: `${store.globalGrowth}`,
    isValid: true
  })

  const [retireOn, setRetireOn] = useState({
    value: fromYYYY(store.retireOn) as Date | null,
    isValid: true
  })

  const saveGrowth = useDebounceCallback(useAction((store, growth: number) => {
    store.globalGrowth = growth
  }, []), 200)

  const onGrowthChanged = useCallback((e: ChangeEvent) => {
    const value = getTargetValue(e)
    const parsedValue = parseFloat(value)
    const isValid = !Number.isNaN(parsedValue)
    setGrowth({ value, isValid })

    if (isValid) {
      saveGrowth(parsedValue)
    }
  }, [saveGrowth])

  const onRetireAtChanged = useAction((_, value: Date | null) => {
    const parsedValue = isDate(value) ? toYYYY(value) : null
    const isValid = parsedValue !== null
    setRetireOn({ value, isValid })

    if (isValid) {
      store.retireOn = parsedValue
    }
  }, [])

  const onStrategyChanged = useAction((_, value: string) => {
    if (store.strategies.has(value)) {
      store.strategyId = value
    } else {
      store.strategyId = null
    }
  }, [])

  return (
    <AppBar position='fixed' sx={sx}>
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" onClick={store.menu.toggle} sx={{ mr: 2 }}>
          {store.menu.isOpen ? <Close /> : <Menu />}
        </IconButton>
        <Hidden mdDown>
          <Icon sx={{ mr: 1 }}><TrendingUp /></Icon>
          <Typography variant='h5' component='h1' onClick={navigateHome} sx={{ cursor: 'pointer' }}>
            Savings Planner
          </Typography>
        </Hidden>
        <ThemeProvider theme={darkTheme}>
          <SelectField
            allowEmpty
            label='Strategy'
            onChange={onStrategyChanged}
            options={store.strategies.values.map(({ id, name }) => ({ value: id, label: name }))}
            size='small'
            sx={{ ml: 'auto', width: '120px' }}
            value={store.strategy?.id ?? ''}
          />
          <DatePicker
            label='Retirement date'
            onChange={onRetireAtChanged}
            slotProps={{
              textField: {
                error: !retireOn.isValid,
                fullWidth: true,
                size: 'small',
                sx: { ml: 1, width: '120px' }
              }
            }}
            value={retireOn.value}
            views={['month', 'year']}
          />
          <TextField
            InputLabelProps={{
              shrink: true
            }}
            error={!growth.isValid}
            label='Growth %'
            onChange={onGrowthChanged}
            size='small'
            sx={{ ml: 1, width: '80px' }}
            type='number'
            value={growth.value}
          />
        </ThemeProvider>
      </Toolbar>
    </AppBar>
  );
})