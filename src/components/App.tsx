import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Container, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import { enGB } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useStore } from '../utils/mobx';
import { Balances } from './balances/Balances';
import { Dialogs } from './dialogs/Dialogs';
import { Header } from './Header';
import { Menu } from './Menu'
import { COLLAPSED_MENU_WIDTH, FULL_MENU_WIDTH } from './sizes';
import { Settings } from './Settings';
import { theme } from './theme';

export const App = observer(function App() {
  const store = useStore()
  const menuWidth = store.menu.isOpen ? FULL_MENU_WIDTH : COLLAPSED_MENU_WIDTH

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
        <HashRouter>
          <Box sx={{ display: 'flex', height: '100%' }}>
            <CssBaseline />

            <Header sx={{ zIndex: theme => theme.zIndex.drawer + 1 }} />

            <Menu sx={{
              width: { sm: menuWidth },
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              })
            }} />

            <Container maxWidth={false} sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              mb: 2,
              overflow: 'hidden',
              width: { sm: `calc(100% - ${menuWidth}px)` }
            }}>
              <Toolbar sx={{ mb: 2 }}/>
              <Routes>
                <Route path='/' element={<Balances />} />
                <Route path='/settings' element={<Settings />} />
              </Routes>
            </Container>

            <Dialogs />
          </Box>
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  )
})