import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material"
import {
  Edit as EditIcon,
  TrendingUp,
  TrendingDown,
  PendingActions,
  Groups,
  PersonAdd,
  AttachMoney,
  Euro,
  CurrencyYen,
  AccountBalance
} from "@mui/icons-material"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const currencyRates = [
  { currency: "USD", rate: 1.0000, change: 0.0, flag: "🇺🇸" },
  { currency: "EUR", rate: 0.8234, change: -0.0012, flag: "🇪🇺" },
  { currency: "JPY", rate: 149.80, change: 0.45, flag: "🇯🇵" },
  { currency: "GBP", rate: 0.7891, change: 0.0023, flag: "🇬🇧" },
  { currency: "CAD", rate: 1.3456, change: -0.0078, flag: "🇨🇦" },
]

const glassEelPriceFlow = [
  { role: "Fisherman", action: "To association", priceTier: "300.0", profit: "0" },
  { role: "Collection Center", action: "To Coll. Center", priceTier: "350.0", profit: "50" },
  { role: "Association", action: "To Client", priceTier: "400.0", profit: "50" },
  { role: "Client", action: "Purchase", priceTier: "400.0", profit: "0" },
]

const activeUsers = {
  association: 12,
  collectionCenter: 8,
  fisherman: 156,
  clients: 89
}

const pendingUsers = {
  association: 3,
  collectionCenter: 2,
  fisherman: 23,
  clients: 14
}

const chartData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
]

export function Dashboard() {
  const [editingCurrency, setEditingCurrency] = useState(false)
  const [editingGlassEel, setEditingGlassEel] = useState(false)

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "primary" }) => (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(0, 168, 232, 0.3)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ color: '#00588be0', fontSize: 48, opacity: 0.8 }} />
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ color: '#00588be0', mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Currency Daily Rates */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: '#ffffff1a',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney sx={{ color: '#00588be0' }} />
                  <Typography variant="h6" sx={{ color: '#0e0e0eff' }}>
                    Currency Daily Rates
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setEditingCurrency(!editingCurrency)}
                  sx={{ color: '#00588be0' }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
            </CardContent>
          </Card>
        </Grid>

        {/* Glass Eel Price Flow */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: '#ffffff1a',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance sx={{ color: '#00588be0' }} />
                  <Typography variant="h6" sx={{ color: '#0e0e0eff' }}>
                    Glass Eel Price Flow
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setEditingGlassEel(!editingGlassEel)}
                  sx={{ color: '#00588be0' }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>Role</TableCell>
                      <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>Action</TableCell>
                      <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>Price Tier / Kg</TableCell>
                      <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>Profit (usd)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {glassEelPriceFlow.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>
                          {item.role}
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>
                          {item.action}
                        </TableCell>
                        <TableCell sx={{ border: 'none' }}>
                          <Chip 
                            label={item.priceTier}
                            size="small"
                            sx={{ 
                              background: 'rgba(0, 168, 232, 0.2)',
                              color: '#0e0e0eff',
                              border: '1px solid rgba(0, 168, 232, 0.5)'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#4caf50', border: 'none', fontWeight: 600 }}>
                          {item.profit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Orders */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Pending Orders"
            value="47"
            subtitle="Awaiting processing"
            icon={PendingActions}
          />
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#0e0e0eff' }}>
                  Active Accounts
                </Typography>
                <Groups sx={{ color: '#00588be0' }} />
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Association" 
                    secondary={`${activeUsers.association} active`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#0e0e0eff' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Collection Center" 
                    secondary={`${activeUsers.collectionCenter} active`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#0e0e0eff' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Fisherman" 
                    secondary={`${activeUsers.fisherman} active`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#0e0e0eff' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Clients" 
                    secondary={`${activeUsers.clients} active`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#0e0e0eff' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Users */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#0e0e0eff' }}>
                  Pending Users
                </Typography>
                <PersonAdd sx={{ color: '#ff9800' }} />
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Association" 
                    secondary={`${pendingUsers.association} pending`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#ff9800' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Collection Center" 
                    secondary={`${pendingUsers.collectionCenter} pending`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#ff9800' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Fisherman" 
                    secondary={`${pendingUsers.fisherman} pending`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#ff9800' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Clients" 
                    secondary={`${pendingUsers.clients} pending`}
                    primaryTypographyProps={{ color: '#0e0e0eff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#ff9800' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#0e0e0eff', mb: 2 }}>
                Monthly Activity Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 77, 122, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#0e0e0eff'
                      }} 
                    />
                    <Bar dataKey="value" fill="#00588be0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}