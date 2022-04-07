import { Close, Menu, ShowChart } from '@mui/icons-material';
import {
  AppBar, Hidden, Icon, IconButton,
  SxProps, Theme, Toolbar, Typography
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStore } from '../utils/mobx';
import { useNavigateTo } from '../utils/router';

interface Props {
  sx?: SxProps<Theme>
}

export const Header = observer(function Header({ sx }: Props) {
  const menu = useStore(store => store.menu)
  const navigateHome = useNavigateTo('/')

  return (
    <AppBar position='fixed' sx={sx}>
      <Toolbar>
        <Hidden mdUp>
          <IconButton size="large" edge="start" color="inherit" onClick={menu.toggle} sx={{ mr: 2 }}>
            {menu.isOpen ? <Close /> : <Menu />}
          </IconButton>
        </Hidden>
        <Icon sx={{ mr: 1 }}><ShowChart /></Icon>
        <Typography variant='h5' component='h1' onClick={navigateHome} sx={{ cursor: 'pointer' }}>Savings Planner</Typography>
      </Toolbar>
    </AppBar>
  );
})