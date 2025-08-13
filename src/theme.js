import { createTheme } from "@mui/material/styles"

const seaBlueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00a8e8',
      light: '#00d4ff',
      dark: '#004d7a'
    },
    secondary: {
      main: '#0077be',
      light: '#007acc',
      dark: '#002d47'
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.1)'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }
    }
  }
})

export default seaBlueTheme
