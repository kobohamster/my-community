import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#402A1E',
      light: '#6B4C3B',
      dark: '#2C1810',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#BDBFAA',
      light: '#D4D6C3',
      dark: '#9A9C88',
      contrastText: '#2C1810',
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C1810',
      secondary: '#6B4C3B',
    },
    error: { main: '#C0392B' },
    success: { main: '#27AE60' },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 700 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem' },
  },
  spacing: 8,
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
        containedPrimary: {
          '&:hover': { backgroundColor: '#2C1810' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(64,42,30,0.08)',
          '&:hover': { boxShadow: '0 4px 16px rgba(64,42,30,0.15)' },
          transition: 'box-shadow 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
  },
})

export default theme
