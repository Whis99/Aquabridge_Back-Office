import React from "react"
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { Waves } from "@mui/icons-material"
import { navigationItems } from "../../navigationItems"

const drawerWidth = 280

export default function Sidebar({ mobileOpen, handleDrawerToggle, activeTab, setActiveTab }) {
  const drawerContent = (
    <Box sx={{ background: 'linear-gradient(180deg, #026eadff 0%, #00588be0 100%)', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Waves sx={{ color: '#00a8e8', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
            Aquabridge
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 1)', mt: 0.5 }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton
              onClick={() => {
                setActiveTab(item.title)
                handleDrawerToggle(false) // close on mobile
              }}
              selected={activeTab === item.title}
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
                    fontWeight: activeTab === item.title ? 600 : 400
                  }
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => handleDrawerToggle(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
