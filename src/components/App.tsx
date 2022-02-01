import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { enGB } from 'date-fns/locale';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useMenuOpen } from '../state/menu';
import { Accounts } from './accounts/Accounts';
import { Body } from './Body';
import { Header } from './Header';
import { Home } from './Home';
import { COLLAPSED_MENU_WIDTH, FULL_MENU_WIDTH, Menu } from './Menu';
import { People } from './people/People';


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

            <Body sx={{
              flexGrow: 1,
              width: {
                sm: `calc(100% - ${smMenuWidth}px)`,
                md: `calc(100% - ${FULL_MENU_WIDTH}px)`
              }
            }}>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/people/*' element={<People />} />
                <Route path='/accounts/*' element={<Accounts />} />
              </Routes>
            </Body>
          </Box>
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
