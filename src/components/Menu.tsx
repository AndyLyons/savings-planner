import { Savings, Settings } from '@mui/icons-material';
import {
  Box, Divider, Drawer, List, ListItemIcon,
  ListItemText, SxProps, Theme, Toolbar
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useMin } from '../utils/breakpoints';
import { useStore } from '../utils/mobx';
import { useLocationChanged } from '../utils/router';
import { ListItemButtonLink } from './mui/ListItemButtonLink';

export const FULL_MENU_WIDTH = 250
export const COLLAPSED_MENU_WIDTH = 57

interface Props {
    sx?: SxProps<Theme>
}

export const Menu = observer(function Menu({ sx }: Props) {
  const store = useStore()
  const { pathname } = useLocation()
  const hasSidebar = useMin('sm')

  useLocationChanged(store.menu.closeMenu)

  return (
    <Box component='nav' sx={sx}>
      <Drawer
        anchor='left'
        onClose={store.menu.closeMenu}
        open={store.menu.isOpen}
        variant={hasSidebar ? 'permanent' : 'temporary'}
        sx={{
          '& .MuiDrawer-paper': {
            width: {
              xs: FULL_MENU_WIDTH,
              sm: store.menu.isOpen ? FULL_MENU_WIDTH : COLLAPSED_MENU_WIDTH
            },
            boxSizing: 'border-box',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden'
          }
        }}
      >
        <Toolbar />
        <List>
          <ListItemButtonLink to='/' selected={pathname === '/'}>
            <ListItemIcon><Savings color='primary' /></ListItemIcon>
            <ListItemText>Savings</ListItemText>
          </ListItemButtonLink>
          <Divider />
          <ListItemButtonLink to='/settings' selected={pathname.startsWith('/settings')}>
            <ListItemIcon><Settings color='primary' /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </ListItemButtonLink>
        </List>
      </Drawer>
    </Box>
  )
})