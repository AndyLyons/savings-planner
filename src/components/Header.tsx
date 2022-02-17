import { Close, Menu, ShowChart, TextSnippet } from '@mui/icons-material';
import {
  AppBar, Dialog, DialogContent, Hidden, Icon, IconButton,
  SxProps, Theme, Toolbar, Typography
} from '@mui/material';
import { Box } from '@mui/system';
import { useSelector } from '../state/app';
import { useMenuOpen, useToggleMenu } from '../state/menu';
import { useBoolean } from '../utils/hooks';
import { useNavigateTo } from '../utils/router';

interface Props {
  sx?: SxProps<Theme>
}

export function Header({ sx }: Props) {
  const isMenuOpen = useMenuOpen()
  const toggleMenu = useToggleMenu()
  const navigateHome = useNavigateTo('/')

  const [isLogsOpen, , closeLogs, toggleLogs] = useBoolean(false)
  const logs = useSelector(state => state.logs)

  return (
    <AppBar position='fixed' sx={sx}>
      <Toolbar>
        <Hidden mdUp>
          <IconButton size="large" edge="start" color="inherit" onClick={toggleMenu} sx={{ mr: 2 }}>
            {isMenuOpen ? <Close /> : <Menu />}
          </IconButton>
        </Hidden>
        <Icon sx={{ mr: 1 }}><ShowChart /></Icon>
        <Typography variant='h5' component='h1' onClick={navigateHome} sx={{ cursor: 'pointer' }}>Savings Planner</Typography>
        <IconButton edge='end' onClick={toggleLogs}><TextSnippet /></IconButton>
      </Toolbar>
      <Dialog open={isLogsOpen} fullScreen onClose={closeLogs}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeLogs}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Toolbar>
          <DialogContent>
            {isLogsOpen && logs.map((log, i) => <Box key={i}>{log}</Box>)}
          </DialogContent>
        </AppBar>
      </Dialog>
    </AppBar>
  );
}
