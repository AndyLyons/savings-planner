import { HashRouter, Route, Routes } from 'react-router-dom';
import { enGB } from 'date-fns/locale'
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { Body } from './Body';
import { Header } from './Header';
import { Menu, MENU_WIDTH } from './Menu';
import { Home } from './Home';
import { People } from './people/People';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  }
})

export function App() {
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
                width: { md: MENU_WIDTH },
              }}
            />

            <Body sx={{
              flexGrow: 1,
              width: { md: `calc(100% - ${MENU_WIDTH}px)` }
            }}>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/people/*' element={<People />} />
              </Routes>
            </Body>
          </Box>
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
