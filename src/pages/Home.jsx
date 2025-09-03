// Home.jsx
import React from 'react'
import { Box, Toolbar } from '@mui/material'
import Sidebar from '../components/drawer/Sidebar'
import { Outlet } from 'react-router-dom'

const Home = () => {
  const [language, setLanguage] = React.useState('EN')
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = (open = !mobileOpen) => {
    setMobileOpen(open)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top menu bar
        <Menu 
          language={language} 
          setLanguage={setLanguage} 
          onMenuClick={() => handleDrawerToggle(true)} // optional for mobile
        /> */}

        {/* Toolbar spacer (only if Menu isn't fixed) */}
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
