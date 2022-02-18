import { Close, Menu, ShowChart } from '@mui/icons-material';
import {
  AppBar, Hidden, Icon, IconButton,
  SxProps, Theme, Toolbar, Typography
} from '@mui/material';
import { useMenuOpen, useToggleMenu } from '../state/menu';
import { useNavigateTo } from '../utils/router';

interface Props {
  sx?: SxProps<Theme>
}

export function Header({ sx }: Props) {
  const isMenuOpen = useMenuOpen()
  const toggleMenu = useToggleMenu()
  const navigateHome = useNavigateTo('/')

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
      </Toolbar>
    </AppBar>
  );
}
