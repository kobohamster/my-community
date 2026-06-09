import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#04080f',
      paper: '#080f1e',
    },
    primary: {
      main: '#3a7bd5',
      light: '#5a9be8',
      dark: '#1a5aaa',
      contrastText: '#e8f0fa',
    },
    secondary: {
      main: '#1a3d6b',
      light: '#2a5590',
      dark: '#0d2040',
      contrastText: '#b0cce8',
    },
    text: {
      primary: '#f0f8ff',
      secondary: '#b8d4e8',
      disabled: '#7a9ab0',
    },
    divider: 'rgba(58, 123, 213, 0.15)',
    error: { main: '#c05070' },
    success: { main: '#4a8e6a' },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '0.05em' },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.1rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', color: '#b8d4e8' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.03em',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3a7bd5 0%, #1a5aaa 100%)',
          color: '#e8f0fa',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a9be8 0%, #3a7bd5 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#080f1e',
          border: '1px solid rgba(58, 123, 213, 0.12)',
          transition: 'border 0.2s',
          '&:hover': {
            border: '1px solid rgba(58, 123, 213, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(58, 123, 213, 0.25)' },
            '&:hover fieldset': { borderColor: 'rgba(58, 123, 213, 0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#3a7bd5' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3a7bd5' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(58, 123, 213, 0.15)' },
      },
    },
  },
  spacing: 8,
})

export default theme
