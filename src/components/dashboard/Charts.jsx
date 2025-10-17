import React, { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Charts = ({ 
  eelTradingData, 
  eelTradingFilter, 
  onEelTradingFilterChange,
  ordersData,
  ordersFilter,
  onOrdersFilterChange
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Memoized eel trading data processing
  const processedEelTradingData = useMemo(() => {
    if (!eelTradingData || eelTradingData.length === 0) return []
    
    const data = eelTradingData[eelTradingFilter] || []
    return data.map(item => ({
      name: item.name,
      value: item.totalQty || 0,
      count: item.count || 0
    }))
  }, [eelTradingData, eelTradingFilter])

  // Memoized orders data processing
  const processedOrdersData = useMemo(() => {
    if (!ordersData || ordersData.length === 0) return []
    
    const data = ordersData[ordersFilter] || []
    return data.map(item => ({
      name: item.name,
      value: item.value || 0,
      count: item.count || 0
    }))
  }, [ordersData, ordersFilter])

  const filterButtons = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Glass Eel Trading Chart */}
        <Box sx={{ flex: 1 }}>
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
              {/* Chart header with title and time period filters */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    pr: 2
                  }}
                >
                  Glass Eel Trading Activity
                </Typography>
                
                {/* Time period filter buttons - Daily, Weekly, Monthly, Yearly */}
                <ButtonGroup
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiButton-root': {
                      borderColor: 'rgba(0, 168, 232, 0.3)',
                      color: '#00a8e8',
                      fontSize: '0.75rem',
                      px: 1.5,
                      py: 0.5,
                      minWidth: 'auto',
                      '&:hover': {
                        borderColor: '#00a8e8',
                        backgroundColor: 'rgba(0, 168, 232, 0.1)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#00a8e8',
                        color: 'white',
                        borderColor: '#00a8e8',
                        '&:hover': {
                          backgroundColor: '#0077be',
                          borderColor: '#0077be'
                        }
                      }
                    }
                  }}
                >
                  {filterButtons.map((filter) => (
                    <Button
                      key={filter.value}
                      onClick={() => onEelTradingFilterChange(filter.value)}
                      variant={eelTradingFilter === filter.value ? 'contained' : 'outlined'}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>

              {/* Chart description explaining the purpose */}
              <Typography
                variant="body2"
                sx={{
                  color: '#4f4f4fb3',
                  mb: 3,
                  fontSize: '0.85rem',
                  lineHeight: 1.4
                }}
              >
                Shows the quantity of glass eels sold by fishermen to associations over time. 
                This chart tracks the volume of glass eel transactions in the supply chain.
              </Typography>

              {/* Chart container with responsive height */}
              <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedEelTradingData}>
                    {/* Grid lines for better readability */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 168, 232, 0.1)" />
                    
                    {/* X-axis showing time periods */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#4f4f4fb3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    
                    {/* Y-axis showing glass eel quantity amounts */}
                    <YAxis 
                      stroke="#4f4f4fb3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                    />
                    
                    {/* Interactive tooltip showing detailed information */}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#0e0e0eff', fontWeight: 600 }}
                      formatter={(value, name) => [
                        `${value} kg`,
                        'Glass Eel Quantity'
                      ]}
                    />
                    
                    {/* Line chart showing glass eel quantity sold over time */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00a8e8"
                      strokeWidth={3}
                      dot={{ fill: '#00a8e8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#00a8e8', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Orders Performance Chart */}
        <Box sx={{ flex: 1 }}>
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
              {/* Chart header with title and time period filters */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    pr: 2
                  }}
                >
                  Orders Performance
                </Typography>
                
                {/* Time period filter buttons - Daily, Weekly, Monthly, Yearly */}
                <ButtonGroup
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiButton-root': {
                      borderColor: 'rgba(0, 168, 232, 0.3)',
                      color: '#00a8e8',
                      fontSize: '0.75rem',
                      px: 1.5,
                      py: 0.5,
                      minWidth: 'auto',
                      '&:hover': {
                        borderColor: '#00a8e8',
                        backgroundColor: 'rgba(0, 168, 232, 0.1)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#00a8e8',
                        color: 'white',
                        borderColor: '#00a8e8',
                        '&:hover': {
                          backgroundColor: '#0077be',
                          borderColor: '#0077be'
                        }
                      }
                    }
                  }}
                >
                  {filterButtons.map((filter) => (
                    <Button
                      key={filter.value}
                      onClick={() => onOrdersFilterChange(filter.value)}
                      variant={ordersFilter === filter.value ? 'contained' : 'outlined'}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>

              {/* Chart description explaining the purpose */}
              <Typography
                variant="body2"
                sx={{
                  color: '#4f4f4fb3',
                  mb: 3,
                  fontSize: '0.85rem',
                  lineHeight: 1.4
                }}
              >
                Shows the number of orders placed by clients over time. 
                This chart tracks order volume and business performance trends.
              </Typography>

              {/* Chart container with responsive height */}
              <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedOrdersData}>
                    {/* Grid lines for better readability */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 168, 232, 0.1)" />
                    
                    {/* X-axis showing time periods */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#4f4f4fb3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    
                    {/* Y-axis showing order counts */}
                    <YAxis 
                      stroke="#4f4f4fb3"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    
                    {/* Interactive tooltip showing detailed information */}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#0e0e0eff', fontWeight: 600 }}
                      formatter={(value, name) => [
                        `${value} orders`,
                        'Order Count'
                      ]}
                    />
                    
                    {/* Line chart showing order counts over time */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00a8e8"
                      strokeWidth={3}
                      dot={{ fill: '#00a8e8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#00a8e8', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default Charts
