import React from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme, 
  useMediaQuery 
} from '@mui/material'
import {
  Groups,
  PersonAdd,
  PendingActions,
  AttachMoney,
  AccountBalance,
  AccountBalanceWallet
} from '@mui/icons-material'

const KPICards = ({ 
  totalUsers, 
  activeUsers, 
  pendingUsers, 
  newSignups, 
  pendingOrdersCount, 
  pendingWithdrawalsCount, 
  totalRevenue, 
  completedOrdersCount,
  isLoading = false 
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Debug: Log the values being passed
  console.log("KPICards props:", {
    totalUsers,
    activeUsers,
    pendingUsers,
    newSignups,
    pendingOrdersCount,
    pendingWithdrawalsCount,
    totalRevenue,
    completedOrdersCount,
    isLoading
  })

  const kpiData = [
    { 
      title: "Total Users", 
      value: totalUsers || 0, 
      icon: Groups,
      description: "All registered users"
    },
    { 
      title: "Active Users", 
      value: activeUsers || 0, 
      icon: PersonAdd,
      description: "Currently active users"
    },
    { 
      title: "Pending Users", 
      value: pendingUsers || 0, 
      icon: PendingActions,
      description: "Awaiting approval"
    },
    { 
      title: "Pending Orders", 
      value: pendingOrdersCount || 0, 
      icon: AccountBalance,
      description: "Orders pending processing"
    },
    { 
      title: "Pending Withdrawals", 
      value: pendingWithdrawalsCount || 0, 
      icon: AccountBalanceWallet,
      description: "Withdrawal requests pending"
    },
    { 
      title: "Total Revenue", 
      value: totalRevenue || 0, 
      icon: AttachMoney,
      description: "Total revenue generated"
    }
  ]

  return (
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
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5
        }}>
          <Typography
            variant={isMobile ? "body2" : "subtitle1"}
            sx={{
              color: '#0e0e0eff',
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            Key Performance Indicators
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  color: '#4f4f4fb3', 
                  fontSize: isMobile ? '0.6rem' : '0.7rem', 
                  py: 0.5,
                  borderBottom: '1px solid rgba(0, 168, 232, 0.2)'
                }}>
                  Metric
                </TableCell>
                <TableCell sx={{ 
                  color: '#4f4f4fb3', 
                  fontSize: isMobile ? '0.6rem' : '0.7rem', 
                  py: 0.5,
                  borderBottom: '1px solid rgba(0, 168, 232, 0.2)'
                }}>
                  Value
                </TableCell>
                <TableCell sx={{ 
                  color: '#4f4f4fb3', 
                  fontSize: isMobile ? '0.6rem' : '0.7rem', 
                  py: 0.5,
                  borderBottom: '1px solid rgba(0, 168, 232, 0.2)'
                }}>
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiData.map((kpi, index) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(0, 168, 232, 0.05)' } }}>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    fontSize: isMobile ? '0.65rem' : '0.75rem', 
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <kpi.icon sx={{ 
                      color: '#00a8e8', 
                      fontSize: isMobile ? 14 : 16 
                    }} />
                    {kpi.title}
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    fontSize: isMobile ? '0.65rem' : '0.75rem', 
                    py: 0.5,
                    fontWeight: 600
                  }}>
                    {isLoading ? '...' : (typeof kpi.value === 'number' ? kpi.value.toLocaleString() : '0')}
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#4f4f4fb3', 
                    fontSize: isMobile ? '0.6rem' : '0.7rem', 
                    py: 0.5
                  }}>
                    {kpi.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default KPICards