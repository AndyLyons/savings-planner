import {
    Box, Drawer, List, ListItemIcon,
    ListItemText, SxProps, Theme, Toolbar
} from "@mui/material";
import { Home, Person } from '@mui/icons-material';
import { ListItemButtonLink } from "./mui/ListItemButtonLink";
import { useMin } from "../utils/breakpoints";
import { useLocationChanged } from "../utils/router";
import { useMenuOpen, useToggleMenu } from "../state/menu";

export const MENU_WIDTH = 250

interface Props {
    sx?: SxProps<Theme>
}

export function Menu({ sx }: Props) {
    const isOpen = useMenuOpen()
    const closeMenu = useToggleMenu(false)
    const isDesktop = useMin('md')

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
                        width: MENU_WIDTH,
                        boxSizing: 'border-box'
                    }
                }}
            >
                <Toolbar />
                <List>
                    <ListItemButtonLink to='/'>
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText>Home</ListItemText>
                    </ListItemButtonLink>
                    <ListItemButtonLink to='/people'>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText>People</ListItemText>
                    </ListItemButtonLink>
                </List>
            </Drawer>
        </Box>
    )
}