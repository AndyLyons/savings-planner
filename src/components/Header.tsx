import { Close, Menu, ShowChart } from '@mui/icons-material';
import {
  AppBar, Hidden, Icon, IconButton,
  SxProps, TextField, Theme, ThemeProvider, Toolbar, Typography
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ChangeEvent, getTargetValue } from '../utils/hooks';
import { useAction, useStore } from '../utils/mobx';
import { useNavigateTo } from '../utils/router';
import { darkTheme } from './App';

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

  const onGrowthChanged = useAction((store, e: ChangeEvent) => {
    const value = getTargetValue(e)
    const parsedValue = parseFloat(value)
    const isValid = !Number.isNaN(parsedValue)
    setGrowth({ value, isValid })

    if (isValid) {
      store.globalGrowth = parsedValue
    }
  }, [])

  return (
    <AppBar position='fixed' sx={sx}>
      <Toolbar>
        <Hidden mdUp>
          <IconButton size="large" edge="start" color="inherit" onClick={store.menu.toggle} sx={{ mr: 2 }}>
            {store.menu.isOpen ? <Close /> : <Menu />}
          </IconButton>
        </Hidden>
        <Icon sx={{ mr: 1 }}><ShowChart /></Icon>
        <Typography variant='h5' component='h1' onClick={navigateHome} sx={{ cursor: 'pointer' }}>
          Savings Planner
        </Typography>
        <ThemeProvider theme={darkTheme}>
          <TextField
            InputLabelProps={{
              shrink: true
            }}
            error={!growth.isValid}
            label='Growth %'
            onChange={onGrowthChanged}
            size='small'
            sx={{ ml: 'auto', width: '80px' }}
            type='number'
            value={growth.value}
          />
        </ThemeProvider>
      </Toolbar>
    </AppBar>
  );
})