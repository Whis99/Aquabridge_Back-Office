// Home.jsx
import React from 'react'
import { Box, Toolbar, AppBar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import Sidebar from '../components/drawer/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { navigationItems } from '../navigationItems'

const drawerWidth = 280

const Home = () => {
  const [language, setLanguage] = React.useState('EN')
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [desktopOpen, setDesktopOpen] = React.useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()

  // Get current page title based on route
  const currentPage = navigationItems.find(item => item.path === location.pathname)
  const pageTitle = currentPage?.title || 'Dashboard'

  const handleDrawerToggle = (open = !mobileOpen) => {
    setMobileOpen(open)
  }

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        handleDrawerToggle={handleDrawerToggle}
        handleDesktopDrawerToggle={handleDesktopDrawerToggle}
      />

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar with menu button */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: { sm: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
            ml: { sm: desktopOpen ? `${drawerWidth}px` : 0 },
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={isMobile ? () => handleDrawerToggle(true) : handleDesktopDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                color: '#ffffff'
              }}
            >
              {pageTitle}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Toolbar spacer */}
        <Toolbar />

        {/* Page content */}
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Home
