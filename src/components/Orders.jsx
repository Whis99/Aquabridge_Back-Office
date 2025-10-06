import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material"
import {
  ShoppingCart as OrdersIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Scale as ScaleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { getAllOrders } from "../services/firebaseServices"

const Orders = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all')
  const [timePeriod, setTimePeriod] = useState('daily')
  const [ordersChartData, setOrdersChartData] = useState([])

  // Date range options
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  // Time period options for charts (same as Dashboard)
  const timePeriodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]


  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const ordersData = await getAllOrders()
        setOrders(ordersData)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders

    const now = new Date()
    let startDate

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return orders
    }

    return orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
      return orderDate >= startDate
    })
  }, [orders, dateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length
    const ongoingOrders = filteredOrders.filter(order => order.status === 'ongoing').length
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.netAmount || 0), 0)
    const totalTax = filteredOrders.reduce((sum, order) => sum + (order.taxAmount || 0), 0)
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.totalQty || 0), 0)
    
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0
    const averagePricePerKg = filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, order) => sum + (order.pricePerKg || 0), 0) / filteredOrders.length 
      : 0

    const pendingPercentage = totalOrders > 0 ? (pendingOrders / totalOrders * 100).toFixed(1) : 0
    const ongoingPercentage = totalOrders > 0 ? (ongoingOrders / totalOrders * 100).toFixed(1) : 0
    const completedPercentage = totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0

    return {
      totalOrders,
      pendingOrders,
      ongoingOrders,
      completedOrders,
      pendingPercentage,
      ongoingPercentage,
      completedPercentage,
      totalRevenue,
      totalTax,
      totalQuantity,
      averageOrderValue,
      averagePricePerKg
    }
  }, [filteredOrders])

  // Process chart data (simplified - only orders over time)
  useEffect(() => {
    const processChartData = () => {
      const ordersData = {}

      filteredOrders.forEach(order => {
        const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        if (!createdAt) return

        let periodKey
        let periodLabel

        switch (timePeriod) {
          case 'daily':
            periodKey = createdAt.toISOString().split('T')[0] // YYYY-MM-DD
            periodLabel = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            break
          case 'weekly':
            const weekStart = new Date(createdAt)
            weekStart.setDate(createdAt.getDate() - createdAt.getDay())
            periodKey = weekStart.toISOString().split('T')[0]
            periodLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            break
          case 'monthly':
            periodKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
            periodLabel = createdAt.toLocaleDateString('en-US', { month: 'short' })
            break
          case 'yearly':
            periodKey = createdAt.getFullYear().toString()
            periodLabel = createdAt.getFullYear().toString()
            break
          default:
            return
        }

        // Orders count
        if (!ordersData[periodKey]) {
          ordersData[periodKey] = { name: periodLabel, value: 0, count: 0 }
        }
        ordersData[periodKey].value += 1
        ordersData[periodKey].count += 1
      })

      // Convert to array and sort (same logic as Dashboard)
      const ordersChartData = Object.values(ordersData)
        .sort((a, b) => {
          if (timePeriod === 'daily') {
            const dateA = new Date(a.name + ', ' + new Date().getFullYear())
            const dateB = new Date(b.name + ', ' + new Date().getFullYear())
            return dateA - dateB
          } else if (timePeriod === 'yearly') {
            return a.name.localeCompare(b.name)
          } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return months.indexOf(a.name) - months.indexOf(b.name)
          }
        })

      setOrdersChartData(ordersChartData)
    }

    processChartData()
  }, [filteredOrders, timePeriod])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
          Orders Analytics
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
          >
            {dateRangeOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <OrdersIcon sx={{ fontSize: 28, color: '#2196f3', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatNumber(stats.totalOrders)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <MoneyIcon sx={{ fontSize: 28, color: '#4caf50', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatCurrency(stats.totalRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Tax Collected */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AssessmentIcon sx={{ fontSize: 28, color: '#ff9800', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatCurrency(stats.totalTax)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Tax Collected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 28, color: '#9c27b0', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatCurrency(stats.averageOrderValue)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Average Order Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Quantity */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <ScaleIcon sx={{ fontSize: 28, color: '#00bcd4', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatNumber(stats.totalQuantity.toFixed(1))} kg
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Quantity Ordered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Price per Kg */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TimelineIcon sx={{ fontSize: 28, color: '#795548', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatCurrency(stats.averagePricePerKg)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Avg Price per Kg
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Over Time Chart - Full Width Line Chart */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    pr: 2
                  }}
                >
                  Orders Over Time
                </Typography>
                
                {/* Time period filter buttons - Daily, Weekly, Monthly, Yearly */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
                    <Button
                      key={filter}
                      variant={timePeriod === filter ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setTimePeriod(filter)}
                      sx={{
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        ...(timePeriod === filter ? {
                          background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                          color: '#ffffff',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                          }
                        } : {
                          borderColor: 'rgba(0, 168, 232, 0.3)',
                          color: '#00a8e8',
                          '&:hover': {
                            borderColor: '#00a8e8',
                            background: 'rgba(0, 168, 232, 0.1)'
                          }
                        })
                      }}
                    >
                      {filter}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              {/* Chart description */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4f4f4fb3', 
                  mb: 2, 
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontStyle: 'italic'
                }}
              >
                Track order volume trends over time to identify peak periods and optimize operations
              </Typography>
              
              {/* Chart container with responsive height */}
              <Box sx={{ height: { xs: 250, md: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    <YAxis 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px',
                        color: '#0e0e0eff'
                      }} 
                      formatter={(value, name, props) => {
                        if (name === 'value') {
                          return [`${value}`, 'Orders']
                        }
                        return [value, name]
                      }}
                      labelFormatter={(label) => `${timePeriod === 'daily' ? 'Day' : timePeriod === 'weekly' ? 'Week' : timePeriod === 'yearly' ? 'Year' : 'Month'}: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00a8e8" 
                      strokeWidth={2}
                      dot={{ fill: '#00a8e8', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#00a8e8', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {orders.length === 0 && (
        <Alert severity="info">
          No orders found. Orders will appear here once they are created.
        </Alert>
      )}
    </Box>
  )
}

export default Orders
