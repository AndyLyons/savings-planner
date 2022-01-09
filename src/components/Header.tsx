import {
    AppBar, Hidden, Icon, IconButton,
    SxProps, Theme, Toolbar, Typography
} from '@mui/material';
import { Close, Menu, ShowChart } from '@mui/icons-material';
import { useMenuOpen, useToggleMenu } from '../state/menu';

interface Props {
    sx?: SxProps<Theme>
}

export function Header({ sx }: Props) {
    const isMenuOpen = useMenuOpen()
    const toggleMenu = useToggleMenu()

    return (
        <AppBar position='fixed' sx={sx}>
            <Toolbar>
                <Hidden mdUp>
                    <IconButton size="large" edge="start" color="inherit" onClick={toggleMenu} sx={{ mr: 2 }}>
                        {isMenuOpen ? <Close /> : <Menu />}
                    </IconButton>
                </Hidden>
                <Icon sx={{ mr: 1 }}><ShowChart /></Icon>
                <Typography variant='h5' component='h1'>Savings Planner</Typography>
            </Toolbar>
        </AppBar>
    );
}
