import React from "react"
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { Waves } from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { navigationItems } from "../../navigationItems"
import Logo from "../../assets/Logo.png"

const drawerWidth = 280

export default function Sidebar({ mobileOpen, desktopOpen, handleDrawerToggle, handleDesktopDrawerToggle }) {
  const navigate = useNavigate()
  const location = useLocation()

  const drawerContent = (
    <Box sx={{ 
      background: 'linear-gradient(180deg, #026eadff 0%, #00588be0 100%)', 
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      m: 0,
      p: 0
    }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <Waves sx={{ color: '#00a8e8', fontSize: 32 }} /> */}
          <img src={Logo} alt="TrackYI Logo" width="80" />
          <Box sx={{ flexGrow: 1 }}>

            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Aquabridge
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 1)', mt: 0.5 }}>
              Admin Dashboard
            </Typography>
          </Box>

        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 2, flexGrow: 1, overflow: 'auto' }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  handleDrawerToggle(false) // close on mobile
                }}
                selected={isActive}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                    }
                  },
                  '&:hover': {
                    background: 'rgba(0, 168, 232, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiTypography-root': {
                      color: '#ffffff',
                      fontWeight: isActive ? 600 : 400
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { sm: desktopOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => handleDrawerToggle(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(180deg, #026eadff 0%, #00588be0 100%)',
            overflow: 'hidden'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: 'width 0.3s ease',
            background: 'linear-gradient(180deg, #026eadff 0%, #00588be0 100%)',
            overflow: 'hidden'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
