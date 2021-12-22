import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu } from '@mui/icons-material';

export function Header() {
    return (
        <AppBar position='sticky'>
            <Toolbar>
                <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
                    <Menu />
                </IconButton>
                <Typography variant='h5' component='h1'>Savings Planner</Typography>
            </Toolbar>
        </AppBar>
    );
}
