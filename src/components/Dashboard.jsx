import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  Grid, 
  useTheme, 
  useMediaQuery, 
  CircularProgress,
  Container,
  Paper,
  Stack
} from '@mui/material'
import { useDashboardData } from '../hooks/useDashboardData'
import KPICards from './dashboard/KPICards'
import ExchangeRate from './dashboard/ExchangeRate'
import GlassEelPrice from './dashboard/GlassEelPrice'
import BenefitSettings from './dashboard/BenefitSettings'
import Charts from './dashboard/Charts'

const Dashboard = React.memo(() => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Chart filter states
  const [eelTradingFilter, setEelTradingFilter] = useState('daily')
  const [ordersFilter, setOrdersFilter] = useState('daily')

  // Get all data from custom hook
  const {
    isLoading,
    error,
    totalUsers,
    activeUsers,
    pendingUsers,
    newSignups,
    pendingOrdersCount,
    pendingWithdrawalsCount,
    totalRevenue,
    completedOrdersCount,
    monthlyOrdersData,
    yearlyOrdersData,
    weeklyOrdersData,
    eelTradingData,
    exchangeRate,
    activeEelPrice,
    benefitSettings,
    setExchangeRate,
    setActiveEelPrice,
    setBenefitSettings
  } = useDashboardData()

  // Prepare orders data for charts
  const ordersData = {
    daily: weeklyOrdersData, // Using weekly as daily for now
    weekly: weeklyOrdersData,
    monthly: monthlyOrdersData,
    yearly: yearlyOrdersData
  }

  // Handle exchange rate updates
  const handleExchangeRateUpdate = (newRate) => {
    setExchangeRate(newRate)
  }

  // Handle eel price updates
  const handleEelPriceUpdate = (newPrice) => {
    setActiveEelPrice(newPrice)
  }

  // Handle benefit settings updates
  const handleBenefitSettingsUpdate = (newSettings) => {
    setBenefitSettings(newSettings)
  }

  // Handle chart filter changes
  const handleEelTradingFilterChange = (filter) => {
    setEelTradingFilter(filter)
  }

  const handleOrdersFilterChange = (filter) => {
    setOrdersFilter(filter)
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#f44336', 
              fontWeight: 600,
              mb: 2
            }}
          >
            Error loading dashboard data
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            {error}
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          sx={{
            background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          Dashboard
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#666',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Welcome to Aquabridge Admin Panel - Monitor your glass eel supply chain
        </Typography>
      </Box>
              
      {/* Loading State */}
      {isLoading && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          flexDirection: 'column',
          gap: 3
        }}>
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{ 
              color: '#00a8e8',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontWeight: 500
            }}
          >
            Loading dashboard data...
          </Typography>
        </Box>
      )}

      {/* Main Content */}
      {!isLoading && (
        <Stack spacing={4}>
          {/* Management Cards Section */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Management Controls
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={4}>
                <ExchangeRate 
                  exchangeRate={exchangeRate}
                  onRateUpdate={handleExchangeRateUpdate}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <GlassEelPrice 
                  activeEelPrice={activeEelPrice}
                  onPriceUpdate={handleEelPriceUpdate}
                />
              </Grid>
              <Grid item xs={12} sm={12} lg={4}>
                <BenefitSettings 
                  benefitSettings={benefitSettings}
                  onSettingsUpdate={handleBenefitSettingsUpdate}
                />
              </Grid>
            </Grid>
          </Box>

          {/* KPI Section */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Key Performance Indicators
            </Typography>
            <KPICards 
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              pendingUsers={pendingUsers}
              newSignups={newSignups}
              pendingOrdersCount={pendingOrdersCount}
              pendingWithdrawalsCount={pendingWithdrawalsCount}
              totalRevenue={totalRevenue}
              completedOrdersCount={completedOrdersCount}
              isLoading={isLoading}
            />
          </Box>

          {/* Analytics Section */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Analytics & Trends
            </Typography>
            <Charts 
              eelTradingData={eelTradingData}
              eelTradingFilter={eelTradingFilter}
              onEelTradingFilterChange={handleEelTradingFilterChange}
              ordersData={ordersData}
              ordersFilter={ordersFilter}
              onOrdersFilterChange={handleOrdersFilterChange}
            />
          </Box>
        </Stack>
      )}
    </Container>
  )
})

Dashboard.displayName = 'Dashboard'

export { Dashboard }