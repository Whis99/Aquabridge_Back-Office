import React, { useState, useMemo, useCallback } from "react"
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
  Divider,
  useTheme,
  useMediaQuery,
  Skeleton
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

// Memoized StatCard component for better performance
const StatCard = React.memo(({ title, value, subtitle, icon: Icon, color = "primary" }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      height: '100%',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(0, 168, 232, 0.3)',
        border: '1px solid rgba(0, 168, 232, 0.4)'
      }
    }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="body2"
              sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: 500
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                color: '#0e0e0eff', 
                fontWeight: 600,
                lineHeight: 1.2,
                mb: subtitle ? 0.5 : 0
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4f4f4fb3',
                  fontSize: isMobile ? '0.7rem' : '0.8rem'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ 
            color: '#00588be0', 
            fontSize: isMobile ? 36 : 48, 
            opacity: 0.8,
            flexShrink: 0,
            ml: 1
          }} />
        </Box>
      </CardContent>
    </Card>
  )
})

export function Dashboard() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  
  const [editingCurrency, setEditingCurrency] = useState(false)
  const [editingGlassEel, setEditingGlassEel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Memoized callback functions to prevent unnecessary re-renders
  const handleCurrencyEdit = useCallback(() => {
    setEditingCurrency(prev => !prev)
  }, [])

  const handleGlassEelEdit = useCallback(() => {
    setEditingGlassEel(prev => !prev)
  }, [])

  // Memoized data processing
  const processedChartData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      formattedValue: item.value.toLocaleString()
    }))
  }, [])

  const totalActiveUsers = useMemo(() => {
    return Object.values(activeUsers).reduce((sum, count) => sum + count, 0)
  }, [])

  const totalPendingUsers = useMemo(() => {
    return Object.values(pendingUsers).reduce((sum, count) => sum + count, 0)
  }, [])

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 0.5, sm: 1, md: 1.5 }
    }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            color: '#00588be0', 
            fontWeight: 600,
            mb: 0.5
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Welcome to Aquabridge Admin Panel - Monitor your glass eel supply chain
        </Typography>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Currency Daily Rates */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney sx={{ 
                    color: '#00588be0',
                    fontSize: isMobile ? 20 : 24
                  }} />
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      color: '#0e0e0eff',
                      fontWeight: 600
                    }}
                  >
                    Currency Daily Rates
                  </Typography>
                </Box>
                <IconButton 
                  onClick={handleCurrencyEdit}
                  sx={{ 
                    color: '#00588be0',
                    p: isMobile ? 0.5 : 1
                  }}
                >
                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Box>
              
              {/* Currency Rates Table */}
              {isLoading ? (
                <Box>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} height={40} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#0e0e0eff', border: 'none', fontWeight: 600 }}>
                          Currency
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff', border: 'none', fontWeight: 600 }}>
                          Rate
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff', border: 'none', fontWeight: 600 }}>
                          Change
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currencyRates.slice(0, isMobile ? 3 : 5).map((rate, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>
                                {rate.flag}
                              </span>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {rate.currency}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#0e0e0eff', border: 'none' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rate.rate.toFixed(4)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: 'none' }}>
                            <Chip 
                              label={`${rate.change > 0 ? '+' : ''}${rate.change.toFixed(4)}`}
                              size="small"
                              sx={{ 
                                background: rate.change >= 0 
                                  ? 'rgba(76, 175, 80, 0.2)' 
                                  : 'rgba(244, 67, 54, 0.2)',
                                color: rate.change >= 0 ? '#4caf50' : '#f44336',
                                border: `1px solid ${rate.change >= 0 ? '#4caf50' : '#f44336'}`,
                                fontSize: isMobile ? '0.7rem' : '0.8rem'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Glass Eel Price Flow */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance sx={{ 
                    color: '#00588be0',
                    fontSize: isMobile ? 20 : 24
                  }} />
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      color: '#0e0e0eff',
                      fontWeight: 600
                    }}
                  >
                    Glass Eel Price Flow
                  </Typography>
                </Box>
                <IconButton 
                  onClick={handleGlassEelEdit}
                  sx={{ 
                    color: '#00588be0',
                    p: isMobile ? 0.5 : 1
                  }}
                >
                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Box>
              
              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} height={40} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          color: '#0e0e0eff', 
                          border: 'none', 
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Role
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#0e0e0eff', 
                          border: 'none', 
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Action
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#0e0e0eff', 
                          border: 'none', 
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Price/Kg
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#0e0e0eff', 
                          border: 'none', 
                          fontWeight: 600,
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Profit
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {glassEelPriceFlow.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ 
                            color: '#0e0e0eff', 
                            border: 'none',
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.role}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#0e0e0eff', 
                            border: 'none',
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          }}>
                            <Typography variant="body2">
                              {item.action}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: 'none' }}>
                            <Chip 
                              label={`$${item.priceTier}`}
                              size="small"
                              sx={{ 
                                background: 'rgba(0, 168, 232, 0.2)',
                                color: '#0e0e0eff',
                                border: '1px solid rgba(0, 168, 232, 0.5)',
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#4caf50', 
                            border: 'none', 
                            fontWeight: 600,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          }}>
                            ${item.profit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Orders */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Pending Orders"
            value="47"
            subtitle="Awaiting processing"
            icon={PendingActions}
          />
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 2 
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  sx={{ 
                    color: '#0e0e0eff',
                    fontWeight: 600
                  }}
                >
                  Active Accounts
                </Typography>
                <Groups sx={{ 
                  color: '#00588be0',
                  fontSize: isMobile ? 20 : 24
                }} />
              </Box>
              
              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} height={32} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <List dense>
                  {Object.entries(activeUsers).map(([key, count]) => (
                    <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
                        secondary={`${count} active`}
                        primaryTypographyProps={{ 
                          color: '#0e0e0eff', 
                          variant: 'body2',
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{ 
                          color: '#0e0e0eff',
                          fontSize: isMobile ? '0.7rem' : '0.8rem'
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemText 
                      primary="Total Active" 
                      secondary={`${totalActiveUsers} users`}
                      primaryTypographyProps={{ 
                        color: '#00588be0', 
                        variant: 'body2',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        fontWeight: 600
                      }}
                      secondaryTypographyProps={{ 
                        color: '#00588be0',
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fontWeight: 500
                      }}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Users */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 2 
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  sx={{ 
                    color: '#0e0e0eff',
                    fontWeight: 600
                  }}
                >
                  Pending Users
                </Typography>
                <PersonAdd sx={{ 
                  color: '#ff9800',
                  fontSize: isMobile ? 20 : 24
                }} />
              </Box>
              
              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} height={32} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <List dense>
                  {Object.entries(pendingUsers).map(([key, count]) => (
                    <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
                        secondary={`${count} pending`}
                        primaryTypographyProps={{ 
                          color: '#0e0e0eff', 
                          variant: 'body2',
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{ 
                          color: '#ff9800',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemText 
                      primary="Total Pending" 
                      secondary={`${totalPendingUsers} users`}
                      primaryTypographyProps={{ 
                        color: '#ff9800', 
                        variant: 'body2',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        fontWeight: 600
                      }}
                      secondaryTypographyProps={{ 
                        color: '#ff9800',
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fontWeight: 500
                      }}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  sx={{ 
                    color: '#0e0e0eff',
                    fontWeight: 600
                  }}
                >
                  Monthly Activity Overview
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label="Glass Eel Sales" 
                    size="small"
                    sx={{ 
                      background: 'rgba(0, 168, 232, 0.2)',
                      color: '#00588be0',
                      border: '1px solid rgba(0, 168, 232, 0.5)',
                      fontSize: isMobile ? '0.7rem' : '0.8rem'
                    }}
                  />
                </Box>
              </Box>
              
              {isLoading ? (
                <Skeleton 
                  variant="rectangular" 
                  height={isMobile ? 200 : 300} 
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <Box sx={{ height: isMobile ? 200 : 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedChartData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(255, 255, 255, 0.1)" 
                      />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255, 255, 255, 0.7)"
                        fontSize={isMobile ? 12 : 14}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.7)"
                        fontSize={isMobile ? 12 : 14}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 77, 122, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#0e0e0eff',
                          fontSize: isMobile ? '0.8rem' : '0.9rem'
                        }} 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#00588be0" 
                        radius={[4, 4, 0, 0]}
                        stroke="#0077be"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}