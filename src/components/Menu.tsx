import {
  Box, Divider, Drawer, List, ListItemIcon,
  ListItemText, SxProps, Theme, Toolbar
} from '@mui/material';
import { Home, People } from '@mui/icons-material';
import { ListItemButtonLink } from './mui/ListItemButtonLink';
import { useMin } from '../utils/breakpoints';
import { useLocationChanged } from '../utils/router';
import { useMenuOpen, useToggleMenu } from '../state/menu';
import { useLocation } from 'react-router-dom';

export const FULL_MENU_WIDTH = 250
export const COLLAPSED_MENU_WIDTH = 57

interface Props {
    sx?: SxProps<Theme>
}

export function Menu({ sx }: Props) {
  const { pathname } = useLocation()
  const isOpen = useMenuOpen()
  const closeMenu = useToggleMenu(false)
  const isDesktop = useMin('sm')

  useLocationChanged(closeMenu)

  return (
    <Box component='nav' sx={sx}>
      <Drawer
        anchor='left'
        onClose={closeMenu}
        open={isOpen}
        variant={isDesktop ? 'permanent' : 'temporary'}
        sx={{
          '& .MuiDrawer-paper': {
            width: {
              xs: FULL_MENU_WIDTH,
              sm: isOpen ? FULL_MENU_WIDTH : COLLAPSED_MENU_WIDTH,
              md: FULL_MENU_WIDTH
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
            <ListItemIcon><Home color='primary' /></ListItemIcon>
            <ListItemText>Home</ListItemText>
          </ListItemButtonLink>
          <Divider />
          <ListItemButtonLink to='/people' selected={pathname.startsWith('/people')}>
            <ListItemIcon><People color='primary' /></ListItemIcon>
            <ListItemText>People</ListItemText>
          </ListItemButtonLink>
        </List>
      </Drawer>
    </Box>
  )
}