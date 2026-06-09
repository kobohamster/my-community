import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0d1a',
      paper: '#111428',
    },
    primary: {
      main: '#e8c84a',
      light: '#f5dc7a',
      dark: '#b89a20',
      contrastText: '#0a0d1a',
    },
    secondary: {
      main: '#3a5a8a',
      light: '#5078aa',
      dark: '#1e3a5f',
      contrastText: '#e8e0c8',
    },
    text: {
      primary: '#e8e0c8',
      secondary: '#8090a8',
      disabled: '#404860',
    },
    divider: 'rgba(232, 200, 74, 0.12)',
    error: { main: '#cf6679' },
    success: { main: '#5a9e72' },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '0.05em' },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.1rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', color: '#8090a8' },
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
          background: 'linear-gradient(135deg, #e8c84a 0%, #d4a820 100%)',
          color: '#0a0d1a',
          '&:hover': {
            background: 'linear-gradient(135deg, #f5dc7a 0%, #e8c84a 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#111428',
          border: '1px solid rgba(232, 200, 74, 0.1)',
          transition: 'border 0.2s',
          '&:hover': {
            border: '1px solid rgba(232, 200, 74, 0.35)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(232, 200, 74, 0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(232, 200, 74, 0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#e8c84a' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#e8c84a' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(232, 200, 74, 0.12)' },
      },
    },
  },
  spacing: 8,
})

export default theme
