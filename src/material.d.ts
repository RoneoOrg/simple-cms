import {
  /* the components you used */
  createTheme,
  ThemeProvider
} from "@mui/material/styles";

declare module '@mui/material/styles' {
  interface Palette {
    disabled: Palette['primary'];
  }
  interface PaletteOptions {
    disabled: PaletteOptions['primary'];
  }
}