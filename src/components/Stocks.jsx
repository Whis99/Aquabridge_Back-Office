import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'

// Sample data for portfolio performance
const portfolioData = [
  { month: 'Jan', value: 9000 },
  { month: 'Feb', value: 8500 },
  { month: 'Mar', value: 8200 },
  { month: 'Apr', value: 12000 },
  { month: 'May', value: 18000 },
  { month: 'Jun', value: 22000 }
]

// Sample data for today's trading
const tradingData = [
  { time: '09:00', price: 152.30, volume: 1000 },
  { time: '10:00', price: 153.45, volume: 1200 },
  { time: '11:00', price: 154.20, volume: 1100 },
  { time: '12:00', price: 155.10, volume: 1300 },
  { time: '13:00', price: 156.80, volume: 1400 },
  { time: '14:00', price: 157.25, volume: 1150 },
  { time: '15:00', price: 158.90, volume: 1250 },
  { time: '16:00', price: 159.75, volume: 1350 }
]

// KPI data
const kpiData = {
  portfolioValue: { 
    value: '$21,345', 
    change: '+15.8%', 
    period: 'from last month', 
    trend: 'up' 
  },
  daysGainLoss: { 
    value: '+$342.80', 
    change: '+1.63%', 
    period: 'today', 
    trend: 'up' 
  },
  totalStocks: { 
    value: '12', 
    subtitle: 'Across 5 sectors' 
  },
  bestPerformer: { 
    value: 'AAPL', 
    change: '+1.88%', 
    period: 'today', 
    trend: 'up' 
  }
}

export default function Stocks() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const StatCard = ({ title, value, change, period, trend, subtitle, icon: Icon }) => (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      height: '100%',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
      }
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          <Icon sx={{ 
            color: '#00588be0',
            fontSize: isMobile ? 20 : 24,
            opacity: 0.8
          }} />
        </Box>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            color: '#0e0e0eff', 
            fontWeight: 600,
            mb: 1
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
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {trend === 'up' ? (
              <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16 }} />
            ) : (
              <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend === 'up' ? '#4caf50' : '#f44336',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                fontWeight: 500
              }}
            >
              {change} {period}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const ChartCard = ({ title, subtitle, children }) => (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      height: '100%',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(0, 168, 232, 0.1)'
      }
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              color: '#0e0e0eff',
              fontWeight: 600,
              mb: 0.5
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 0.5, sm: 1, md: 1.5 }
    }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            color: '#00588be0', 
            fontWeight: 600,
            mb: 0.5
          }}
        >
          Stock Portfolio
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Monitor your investments and track market performance
        </Typography>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Portfolio Value"
            value={kpiData.portfolioValue.value}
            change={kpiData.portfolioValue.change}
            period={kpiData.portfolioValue.period}
            trend={kpiData.portfolioValue.trend}
            icon={AttachMoneyIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Day's Gain/Loss"
            value={kpiData.daysGainLoss.value}
            change={kpiData.daysGainLoss.change}
            period={kpiData.daysGainLoss.period}
            trend={kpiData.daysGainLoss.trend}
            icon={ShowChartIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stocks"
            value={kpiData.totalStocks.value}
            subtitle={kpiData.totalStocks.subtitle}
            icon={AssessmentIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Best Performer"
            value={kpiData.bestPerformer.value}
            change={kpiData.bestPerformer.change}
            period={kpiData.bestPerformer.period}
            trend={kpiData.bestPerformer.trend}
            icon={StarIcon}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Portfolio Performance Chart */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Portfolio Performance"
            subtitle="Your portfolio value over time"
          >
            <Box sx={{ height: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00588be0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00588be0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    fontSize={isMobile ? 12 : 14}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    fontSize={isMobile ? 12 : 14}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 77, 122, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#0e0e0eff',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00588be0" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Today's Trading Chart */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Today's Trading"
            subtitle="Real-time stock price and volume"
          >
            <Box sx={{ height: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={tradingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    fontSize={isMobile ? 12 : 14}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    fontSize={isMobile ? 12 : 14}
                    domain={[150, 160]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 77, 122, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#0e0e0eff',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}
                    formatter={(value, name) => [
                      name === 'price' ? `$${value}` : value,
                      name === 'price' ? 'Price' : 'Volume'
                    ]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Scatter 
                    dataKey="price" 
                    fill="#00588be0" 
                    r={6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  )
}