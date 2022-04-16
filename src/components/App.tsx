import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Box, Container, createTheme, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import { enGB } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useStore } from '../utils/mobx';
import { Balances } from './balances/Balances';
import { Dialogs } from './Dialogs';
import { Header } from './Header';
import { Home } from './Home';
import { COLLAPSED_MENU_WIDTH, FULL_MENU_WIDTH, Menu } from './Menu';
import { Settings } from './Settings';
import { Withdrawals } from './withdrawals/Wtihdrawals';

export const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const App = observer(function App() {
  const store = useStore()
  const smMenuWidth = store.menu.isOpen ? FULL_MENU_WIDTH : COLLAPSED_MENU_WIDTH

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
        <HashRouter>
          <Box sx={{ display: 'flex', height: '100%' }}>
            <CssBaseline />

            <Header sx={{ zIndex: theme => theme.zIndex.drawer + 1 }} />

            <Menu sx={{
              flexShrink: { md: 0 },
              width: {
                sm: smMenuWidth,
                md: FULL_MENU_WIDTH
              },
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              })
            }} />

            <Container maxWidth='md' sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              mb: 2,
              overflow: 'hidden',
              width: {
                sm: `calc(100% - ${smMenuWidth}px)`,
                md: `calc(100% - ${FULL_MENU_WIDTH}px)`
              }
            }}>
              <Toolbar sx={{ mb: 2 }}/>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/balances' element={<Balances />} />
                <Route path='/incomes' element={<Withdrawals />} />
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