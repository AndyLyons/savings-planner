import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Box, Container, createTheme, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import { enGB } from 'date-fns/locale';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useMenuOpen } from '../state/menu';
import { Header } from './Header';
import { Home } from './Home';
import { Incomes } from './incomes/Incomes';
import { COLLAPSED_MENU_WIDTH, FULL_MENU_WIDTH, Menu } from './Menu';
import { Savings } from './savings/Savings';
import { Settings } from './Settings';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  }
})

export function App() {
  const isMenuOpen = useMenuOpen()
  const smMenuWidth = isMenuOpen ? FULL_MENU_WIDTH : COLLAPSED_MENU_WIDTH

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
        <HashRouter>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Header
              sx={{
                zIndex: theme => theme.zIndex.drawer + 1
              }}
            />

            <Menu
              sx={{
                flexShrink: { md: 0 },
                width: {
                  sm: smMenuWidth,
                  md: FULL_MENU_WIDTH
                },
                transition: theme => theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen
                })
              }}
            />

            <Container maxWidth='md' sx={{
              flexGrow: 1,
              width: {
                sm: `calc(100% - ${smMenuWidth}px)`,
                md: `calc(100% - ${FULL_MENU_WIDTH}px)`
              }
            }}>
              <Toolbar sx={{ mb: 2 }}/>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/savings' element={<Savings />} />
                <Route path='/incomes' element={<Incomes />} />
                <Route path='/settings' element={<Settings />} />
              </Routes>
            </Container>
          </Box>
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
