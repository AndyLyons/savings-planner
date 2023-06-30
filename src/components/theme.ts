import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  }
})