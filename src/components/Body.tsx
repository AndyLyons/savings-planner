import { Box, Paper, SxProps, Theme, Toolbar } from "@mui/material";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    sx?: SxProps<Theme>
}>

export function Body({ children, sx }: Props) {
    return (
        <Box sx={sx}>
            <Toolbar />
            <Paper sx={{ m: 2, p: 2 }}>
                {children}
            </Paper>
        </Box>
    )
}