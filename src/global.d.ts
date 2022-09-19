declare module 'path-browserify';

declare module '@mui/material/styles' {
  interface Palette {
    disabled: Palette['primary'];
  }
  interface PaletteOptions {
    disabled: PaletteOptions['primary'];
  }
}