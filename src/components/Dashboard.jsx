import React, { useState, useEffect, useMemo, useCallback } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getAllUsers, getAllActiveUsers, getPendingOrders, getAllPendingUsers, getPendingWithdrawals, getTotalRevenue, getAllOrders, getCompletedOrders, getAllTransactions, getCurrentExchangeRate, updateExchangeRate } from "../services/firebaseServices"
import CircularProgress from "@mui/material/CircularProgress"
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
  Skeleton,
  TextField
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
  AccountBalance,
  AccountBalanceWallet
} from "@mui/icons-material"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"


const glassEelPrices = [
  { grade: "Premium A+", price: 850, change: 12.5, flag: "🟢" },
  { grade: "Grade A", price: 720, change: 8.3, flag: "🟡" },
  { grade: "Grade B", price: 580, change: -2.1, flag: "🟠" },
  { grade: "Grade C", price: 420, change: -5.7, flag: "🔴" },
]

const chartData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 9800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
  { name: "Jul", value: 4300 },
  { name: "Aug", value: 5200 },
  { name: "Sep", value: 4800 },
  { name: "Oct", value: 6100 },
  { name: "Nov", value: 5500 },
  { name: "Dec", value: 7200 },
]


const Dashboard = React.memo(() => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State for editing
  const [editingCurrency, setEditingCurrency] = useState(false)
  const [editingGlassEel, setEditingGlassEel] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [totalUsers, setTotalUsers] = useState(null)
  const [activeUsers, setActiveUsers] = useState(null)
  const [pendingUsers, setPendingUsers] = useState(null)
  const [newSignups, setNewSignups] = useState(null)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(null)
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(null)
  const [totalRevenue, setTotalRevenue] = useState(null)
  const [completedOrdersCount, setCompletedOrdersCount] = useState(null)
  const [monthlyOrdersData, setMonthlyOrdersData] = useState([])
  const [yearlyOrdersData, setYearlyOrdersData] = useState([])
  const [weeklyOrdersData, setWeeklyOrdersData] = useState([])
  const [chartFilter, setChartFilter] = useState('daily') // 'daily', 'weekly', 'monthly', 'yearly'
  const [exchangeRate, setExchangeRate] = useState(134) // USD to HTG rate
  const [showRatePopup, setShowRatePopup] = useState(false)
  const [newRate, setNewRate] = useState('')
  const [eelTradingData, setEelTradingData] = useState([])
  const [eelTradingFilter, setEelTradingFilter] = useState('daily')
  const [rateMessage, setRateMessage] = useState({ type: '', text: '' })
  const [isUpdatingRate, setIsUpdatingRate] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetch all in parallel
        const [
          allUsers,
          activeUsersData,
          pendingUsersData,
          pendingOrders,
          pendingWithdrawals,
          transactionsData,
          allOrdersData,
          completedOrdersData,
          allTransactionsData,
          exchangeRateData,
        ] = await Promise.all([
          getAllUsers(),
          getAllActiveUsers(),
          getAllPendingUsers(),
          getPendingOrders(),
          getPendingWithdrawals(),
          getTotalRevenue(),
          getAllOrders(),
          getCompletedOrders(),
          getAllTransactions(),
          getCurrentExchangeRate(),
        ])

        // Calculate new signups (users created in last 7 days)
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        // Handle both old format (with .docs) and new format (direct array)
        const usersArray = allUsers.docs ? allUsers.docs : allUsers
        
        const newSignupsCount = usersArray.filter(doc => {
          const userData = doc.data ? doc.data() : doc
          const createdAt = userData.created_at?.toDate ? userData.created_at.toDate() : new Date(userData.created_at)
          return createdAt && createdAt >= sevenDaysAgo
        }).length

        // Calculate total revenue from transactions (sum of positive amounts)
        // Handle both old format (with .docs) and new format (direct array)
        const transactionsArray = transactionsData.docs ? transactionsData.docs : transactionsData
        
        const totalRevenueAmount = transactionsArray.reduce((sum, doc) => {
          const transaction = doc.data ? doc.data() : doc
          const amount = transaction.amount || transaction.totalCost || 0
          return sum + (amount > 0 ? amount : 0) // Only positive amounts
        }, 0)

        // Calculate orders data for chart (count instead of cost)
        const monthlyData = {}
        const yearlyData = {}
        const weeklyData = {}
        
        // Handle both old format (with .docs) and new format (direct array)
        const ordersArray = allOrdersData.docs ? allOrdersData.docs : allOrdersData
        
        ordersArray.forEach(doc => {
          const order = doc.data ? doc.data() : doc
          const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
          if (createdAt) {
            // Monthly data
            const month = createdAt.toLocaleDateString('en-US', { month: 'short' })
            if (!monthlyData[month]) {
              monthlyData[month] = 0
            }
            monthlyData[month] += 1

            // Yearly data
            const year = createdAt.getFullYear().toString()
            if (!yearlyData[year]) {
              yearlyData[year] = 0
            }
            yearlyData[year] += 1

            // Weekly data (last 12 weeks)
            const weekStart = new Date(createdAt)
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
            const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!weeklyData[weekKey]) {
              weeklyData[weekKey] = 0
            }
            weeklyData[weekKey] += 1
          }
        })

        // Convert to array format for chart
        const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
          name: month,
          value: count,
          count: count
        })).sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return months.indexOf(a.name) - months.indexOf(b.name)
        })

        const yearlyChartData = Object.entries(yearlyData).map(([year, count]) => ({
          name: year,
          value: count,
          count: count
        })).sort((a, b) => a.name.localeCompare(b.name))

        const weeklyChartData = Object.entries(weeklyData)
          .map(([week, count]) => ({
            name: week,
            value: count,
            count: count
          }))
          .sort((a, b) => {
            const dateA = new Date(a.name + ', ' + new Date().getFullYear())
            const dateB = new Date(b.name + ', ' + new Date().getFullYear())
            return dateA - dateB
          })
          .slice(-12) // Last 12 weeks

        // Update state - handle both old format (.size) and new format (.length)
        setTotalUsers(allUsers.size || allUsers.length)
        setActiveUsers(activeUsersData.size || activeUsersData.length)
        setPendingUsers(pendingUsersData.size || pendingUsersData.length)
        setNewSignups(newSignupsCount)
        setPendingOrdersCount(pendingOrders.size || pendingOrders.length)
        setPendingWithdrawalsCount(pendingWithdrawals.size || pendingWithdrawals.length)
        setTotalRevenue(totalRevenueAmount)
        setCompletedOrdersCount(completedOrdersData.size || completedOrdersData.length)
        setMonthlyOrdersData(monthlyChartData)
        setYearlyOrdersData(yearlyChartData)
        setWeeklyOrdersData(weeklyChartData)

        // Process eel trading data (transactions between fishermen and associations)
        // This chart shows the number of glass eel transactions and total quantity sold over time
        const eelTradingMonthly = {}
        const eelTradingYearly = {}
        const eelTradingWeekly = {}
        const eelTradingDaily = {}
        
        // Handle both old format (with .docs) and new format (direct array)
        // Firebase QuerySnapshot has .docs property, while direct arrays don't
        const eelTransactionsArray = allTransactionsData.docs ? allTransactionsData.docs : allTransactionsData
        
        // Debug: Log transaction data structure to understand the format
        console.log("=== Eel Trading Debug ===")
        console.log("Total transactions found:", eelTransactionsArray.length)
        console.log("Sample transaction:", eelTransactionsArray[0])
        
        let eelTradingCount = 0
        
        eelTransactionsArray.forEach(doc => {
          // Extract transaction data - handle both Firebase doc format and direct object format
          const transaction = doc.data ? doc.data() : doc
          const createdAt = transaction.createdAt?.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt)
          
          // Only process valid transactions with valid dates
          if (createdAt && !isNaN(createdAt.getTime())) {
            // Filter for fisherman to association transactions (glass eel sales)
            const isEelTrading = transaction.transaction_type === 'fisherman_to_association'
            
            if (isEelTrading) {
              eelTradingCount++
              const totalQty = transaction.totalQty || 0
              
              // Debug: Log filtered transactions
              console.log("Eel trading transaction found:", {
                transaction_id: transaction.transaction_id,
                totalQty,
                createdAt: createdAt.toISOString(),
                transaction_type: transaction.transaction_type,
                account_id: transaction.account_id,
                entity_id: transaction.entity_id
              })
              
              // Monthly data aggregation - count transactions and sum quantities
              const month = createdAt.toLocaleDateString('en-US', { month: 'short' })
              if (!eelTradingMonthly[month]) {
                eelTradingMonthly[month] = { count: 0, totalQty: 0 }
              }
              eelTradingMonthly[month].count += 1
              eelTradingMonthly[month].totalQty += totalQty

              // Yearly data aggregation
              const year = createdAt.getFullYear().toString()
              if (!eelTradingYearly[year]) {
                eelTradingYearly[year] = { count: 0, totalQty: 0 }
              }
              eelTradingYearly[year].count += 1
              eelTradingYearly[year].totalQty += totalQty

              // Weekly data aggregation (group by week start)
              const weekStart = new Date(createdAt)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
              const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              if (!eelTradingWeekly[weekKey]) {
                eelTradingWeekly[weekKey] = { count: 0, totalQty: 0 }
              }
              eelTradingWeekly[weekKey].count += 1
              eelTradingWeekly[weekKey].totalQty += totalQty

              // Daily data aggregation (last 30 days)
              const dayKey = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              if (!eelTradingDaily[dayKey]) {
                eelTradingDaily[dayKey] = { count: 0, totalQty: 0 }
              }
              eelTradingDaily[dayKey].count += 1
              eelTradingDaily[dayKey].totalQty += totalQty
            }
          }
        })
        
        // Debug: Log aggregated data
        console.log("Eel trading transactions processed:", eelTradingCount)
        console.log("Eel trading monthly data:", eelTradingMonthly)
        console.log("Eel trading yearly data:", eelTradingYearly)
        console.log("Eel trading weekly data:", eelTradingWeekly)
        console.log("Eel trading daily data:", eelTradingDaily)

        // Convert aggregated data to chart-friendly array format
        // Monthly data: Sort by month order (Jan, Feb, Mar, etc.)
        const eelTradingMonthlyChartData = Object.entries(eelTradingMonthly).map(([month, data]) => ({
          name: month,
          value: data.totalQty, // Total quantity of glass eels (kg)
          count: data.count,
          totalQty: data.totalQty // Total quantity of glass eels
        })).sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return months.indexOf(a.name) - months.indexOf(b.name)
        })

        // Yearly data: Sort by year (ascending)
        const eelTradingYearlyChartData = Object.entries(eelTradingYearly).map(([year, data]) => ({
          name: year,
          value: data.totalQty, // Total quantity of glass eels (kg)
          count: data.count,
          totalQty: data.totalQty // Total quantity of glass eels
        })).sort((a, b) => a.name.localeCompare(b.name))

        // Weekly data: Sort by date and take last 12 weeks
        const eelTradingWeeklyChartData = Object.entries(eelTradingWeekly)
          .map(([week, data]) => ({
            name: week,
            value: data.totalQty, // Total quantity of glass eels (kg)
            count: data.count,
            totalQty: data.totalQty // Total quantity of glass eels
          }))
          .sort((a, b) => {
            const dateA = new Date(a.name + ', ' + new Date().getFullYear())
            const dateB = new Date(b.name + ', ' + new Date().getFullYear())
            return dateA - dateB
          })
          .slice(-12) // Last 12 weeks for better chart readability

        // Daily data: Sort by date and take last 30 days
        const eelTradingDailyChartData = Object.entries(eelTradingDaily)
          .map(([day, data]) => ({
            name: day,
            value: data.totalQty, // Total quantity of glass eels (kg)
            count: data.count,
            totalQty: data.totalQty // Total quantity of glass eels
          }))
          .sort((a, b) => {
            const dateA = new Date(a.name + ', ' + new Date().getFullYear())
            const dateB = new Date(b.name + ', ' + new Date().getFullYear())
            return dateA - dateB
          })
          .slice(-30) // Last 30 days for better chart readability

        // Store all chart data in state for the eel trading chart component
        setEelTradingData({
          monthly: eelTradingMonthlyChartData,
          yearly: eelTradingYearlyChartData,
          weekly: eelTradingWeeklyChartData,
          daily: eelTradingDailyChartData
        })

        // Set exchange rate from Firebase
        if (exchangeRateData.success) {
          setExchangeRate(exchangeRateData.data.currentRate)
        }

        // log results AFTER fetch
        console.log("=== Dashboard Stats ===")
        console.log("Total Users:", allUsers.size || allUsers.length)
        console.log("Active Users:", activeUsersData.size || activeUsersData.length)
        console.log("Pending Users:", pendingUsersData.size || pendingUsersData.length)
        console.log("New Signups (7 days):", newSignupsCount)
        console.log("Pending Orders:", pendingOrders.size || pendingOrders.length)
        console.log("Pending Withdrawals:", pendingWithdrawals.size || pendingWithdrawals.length)
        console.log("Total Revenue:", totalRevenueAmount)
        console.log("Completed Orders:", completedOrdersData.size || completedOrdersData.length)
        console.log("Monthly Orders Data:", monthlyChartData)
        console.log("Yearly Orders Data:", yearlyChartData)
        console.log("Weekly Orders Data:", weeklyChartData)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Memoized callback functions to prevent unnecessary re-renders
  const handleCurrencyEdit = useCallback(() => {
    setEditingCurrency(prev => !prev)
  }, [])

  const handleGlassEelEdit = useCallback(() => {
    setEditingGlassEel(prev => !prev)
  }, [])

  const handleRateEdit = useCallback(() => {
    setNewRate(exchangeRate.toString())
    setShowRatePopup(true)
  }, [exchangeRate])

  const handleRateSave = useCallback(async () => {
    const rate = parseFloat(newRate)
    if (!isNaN(rate) && rate > 0) {
      try {
        setIsUpdatingRate(true)
        setRateMessage({ type: '', text: '' })
        
        // Update exchange rate in Firebase
        const result = await updateExchangeRate(rate, "ADM-202509-1344") // TODO: Get actual admin ID from auth
        
        if (result.success) {
          setExchangeRate(rate)
          setShowRatePopup(false)
          setNewRate('')
          setRateMessage({ type: 'success', text: `Exchange rate updated from ${result.oldRate} to ${result.newRate}` })
          setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
        } else {
          setRateMessage({ type: 'error', text: result.message })
          setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
        }
      } catch (error) {
        console.error("Error updating exchange rate:", error)
        setRateMessage({ type: 'error', text: 'Failed to update exchange rate' })
        setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
      } finally {
        setIsUpdatingRate(false)
      }
    }
  }, [newRate])

  const handleRateCancel = useCallback(() => {
    setShowRatePopup(false)
    setNewRate('')
  }, [])

  // Memoized data processing for Orders Performance Chart
  // This function processes the raw orders data based on the selected time filter
  const processedChartData = useMemo(() => {
    let data = []
    switch (chartFilter) {
      case 'yearly':
        data = yearlyOrdersData
        break
      case 'weekly':
        data = weeklyOrdersData
        break
      case 'daily':
        // For daily, we'll use the last 30 days of weekly data or create daily data
        data = weeklyOrdersData.slice(-30) // Last 30 data points
        break
      default:
        data = monthlyOrdersData
    }
    
    // Format the data for display in the chart
    return data.map(item => ({
      ...item,
      formattedValue: item.value.toLocaleString()
    }))
  }, [monthlyOrdersData, yearlyOrdersData, weeklyOrdersData, chartFilter])

  // Memoized eel trading data processing for Eel Trading Chart
  // This function processes the raw eel trading data based on the selected time filter
  const processedEelTradingData = useMemo(() => {
    let data = []
    switch (eelTradingFilter) {
      case 'yearly':
        data = eelTradingData.yearly || []
        break
      case 'weekly':
        data = eelTradingData.weekly || []
        break
      case 'daily':
        data = eelTradingData.daily || []
        break
      default:
        data = eelTradingData.monthly || []
    }
    
    // Format the data for display in the chart
    // Shows total quantity of glass eels sold (kg)
    return data.map(item => ({
      ...item,
      formattedValue: `${item.value} kg`,
      formattedQty: `${item.totalQty} kg`
    }))
  }, [eelTradingData, eelTradingFilter])

  // StatCard Component - Reusable KPI card component
  // Displays a title, value, and icon in a glassmorphism card design
  const StatCard = ({ title, value, icon: Icon }) => (
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
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        {/* Card header with title and icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              fontWeight: 500
            }}
          >
              {title}
            </Typography>
          <Icon sx={{ 
            color: '#00588be0',
            fontSize: isMobile ? 16 : 20,
            opacity: 0.8
          }} />
        </Box>
        {/* Card value display */}
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            color: '#0e0e0eff', 
            fontWeight: 600,
            mb: 0.5
          }}
        >
              {value}
            </Typography>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    // Show loading circle while fetching
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 0.5, sm: 1, md: 1.5 } // Reduced top padding
    }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}> {/* Reduced bottom margin */}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: '#00588be0',
            fontWeight: 600,
            mb: 0.5 // Reduced bottom margin
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

      {/* Charts Section - Top Priority */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
        {/* Glass Eel Trading Chart - Shows fisherman to association transactions over time */}
        {/* Data Source: getAllTransactions() Firebase function */}
        {/* Filters: transaction_type === 'fisherman_to_association' */}
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
              {/* Chart header with title and time period filters */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    pr: 2 // Add padding to the right
                  }}
                >
                  Glass Eel Trading Activity
                </Typography>
                
                {/* Time period filter buttons - Daily, Weekly, Monthly, Yearly */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
                    <Button
                      key={filter}
                      variant={eelTradingFilter === filter ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setEelTradingFilter(filter)}
                      sx={{
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        ...(eelTradingFilter === filter ? {
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
              
              {/* Chart description explaining the purpose */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4f4f4fb3', 
                  mb: 2, 
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontStyle: 'italic'
                }}
              >
                Track the total quantity of glass eels (kg) sold by fishermen to associations over time
              </Typography>
              
              {/* Chart container with responsive height */}
              <Box sx={{ height: { xs: 250, md: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedEelTradingData}>
                    {/* Grid lines for better readability */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    {/* X-axis showing time periods */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    {/* Y-axis showing glass eel quantity amounts */}
                    <YAxis 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    {/* Interactive tooltip showing detailed information */}
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '8px',
                        color: '#0e0e0eff'
                      }} 
                      formatter={(value, name, props) => {
                        if (name === 'value') {
                          return [`${value} kg`, 'Glass Eel Quantity']
                        }
                        return [value, name]
                      }}
                      labelFormatter={(label) => `${eelTradingFilter === 'daily' ? 'Day' : eelTradingFilter === 'weekly' ? 'Week' : eelTradingFilter === 'yearly' ? 'Year' : 'Month'}: ${label}`}
                    />
                    {/* Line chart showing glass eel quantity sold over time */}
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4caf50" 
                      strokeWidth={2}
                      dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Performance Chart */}
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
              {/* Chart header with title and time period filters */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    pr: 2 // Add padding to the right
                  }}
                >
                  Glass Eel Trading Activity
                </Typography>
                
                {/* Time period filter buttons - Daily, Weekly, Monthly, Yearly */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
                    <Button
                      key={filter}
                      variant={eelTradingFilter === filter ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setEelTradingFilter(filter)}
                      sx={{
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        ...(eelTradingFilter === filter ? {
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
              
              {/* Chart description explaining the purpose */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4f4f4fb3', 
                  mb: 2, 
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontStyle: 'italic'
                }}
              >
                Track the total quantity of glass eels (kg) sold by fishermen to associations over time
              </Typography>
              
              {/* Chart container with responsive height */}
              <Box sx={{ height: { xs: 250, md: 300 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedEelTradingData}>
                    {/* Grid lines for better readability */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    {/* X-axis showing time periods */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    {/* Y-axis showing glass eel quantity amounts */}
                    <YAxis 
                      stroke="#4f4f4fb3"
                      fontSize={isMobile ? 10 : 12}
                    />
                    {/* Interactive tooltip showing detailed information */}
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        borderRadius: '8px',
                        color: '#0e0e0eff'
                      }} 
                      formatter={(value, name, props) => {
                        if (name === 'value') {
                          return [`${value} kg`, 'Glass Eel Quantity']
                        }
                        return [value, name]
                      }}
                      labelFormatter={(label) => `${eelTradingFilter === 'daily' ? 'Day' : eelTradingFilter === 'weekly' ? 'Week' : eelTradingFilter === 'yearly' ? 'Year' : 'Month'}: ${label}`}
                    />
                    {/* Line chart showing glass eel quantity sold over time */}
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4caf50" 
                      strokeWidth={2}
                      dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exchange Rate and Glass Eel Prices - Smaller Cards */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
        {/* Exchange Rate - Smaller */}
        <Grid item xs={12} sm={6} lg={3}>
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
              {/* Rate Messages */}
              {rateMessage.text && (
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: rateMessage.type === 'success' ? '#4caf50' : '#f44336',
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  >
                    {rateMessage.text}
                  </Typography>
                </Box>
              )}
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
                  Exchange Rate
                  </Typography>
                <IconButton 
                  size="small"
                  onClick={handleRateEdit}
                  sx={{
                    color: '#00588be0',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 88, 139, 0.1)'
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.7rem' }}>
                        $
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontWeight: 500, fontSize: '0.8rem' }}>
                      USD
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 700, fontSize: '1.1rem' }}>
                    1.00
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="body1" sx={{ color: '#4f4f4fb3', fontWeight: 600, fontSize: '0.9rem' }}>
                    =
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.7rem' }}>
                        G
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontWeight: 500, fontSize: '0.8rem' }}>
                      HTG
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {exchangeRate.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Glass Eel Prices - Smaller */}
        <Grid item xs={12} sm={6} lg={9}>
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
                  Glass Eel Prices (per kg)
                  </Typography>
                <IconButton 
                  size="small"
                  onClick={handleGlassEelEdit}
                  sx={{
                    color: '#00588be0',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 88, 139, 0.1)'
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#4f4f4fb3', fontSize: isMobile ? '0.6rem' : '0.7rem', py: 0.5 }}>Grade</TableCell>
                      <TableCell sx={{ color: '#4f4f4fb3', fontSize: isMobile ? '0.6rem' : '0.7rem', py: 0.5 }}>Price (USD)</TableCell>
                      <TableCell sx={{ color: '#4f4f4fb3', fontSize: isMobile ? '0.6rem' : '0.7rem', py: 0.5 }}>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {glassEelPrices.map((price) => (
                      <TableRow key={price.grade}>
                        <TableCell sx={{ color: '#0e0e0eff', fontSize: isMobile ? '0.65rem' : '0.75rem', py: 0.5 }}>
                          {price.flag} {price.grade}
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff', fontSize: isMobile ? '0.65rem' : '0.75rem', py: 0.5 }}>
                          ${price.price}
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip 
                            label={`${price.change > 0 ? '+' : ''}${price.change.toFixed(1)}%`}
                            size="small"
                            sx={{ 
                              backgroundColor: price.change >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              color: price.change >= 0 ? '#4caf50' : '#f44336',
                              fontSize: isMobile ? '0.55rem' : '0.6rem',
                              height: 18
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KPI Cards Grid - Smaller and Below Charts */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
        {/* Total Users KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Total Users"
            value={isLoading ? "..." : totalUsers?.toLocaleString() || "0"}
            icon={Groups}
          />
        </Grid>

        {/* Active Users KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Active Users"
            value={isLoading ? "..." : activeUsers?.toLocaleString() || "0"}
            icon={Groups}
          />
        </Grid>

        {/* Pending Users KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Pending Users"
            value={isLoading ? "..." : pendingUsers?.toLocaleString() || "0"}
            icon={PersonAdd}
          />
        </Grid>

        {/* Pending Orders KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Pending Orders"
            value={isLoading ? "..." : pendingOrdersCount?.toLocaleString() || "0"}
            icon={PendingActions}
          />
        </Grid>

        {/* Pending Withdrawals KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Pending Withdrawals"
            value={isLoading ? "..." : pendingWithdrawalsCount?.toLocaleString() || "0"}
            icon={AccountBalanceWallet}
          />
        </Grid>

        {/* Total Revenue KPI Card */}
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Total Revenue"
            value={isLoading ? "..." : `$${totalRevenue?.toLocaleString() || "0"}`}
            icon={AttachMoney}
          />
        </Grid>
      </Grid>

      {/* Exchange Rate Edit Popup */}
      {showRatePopup && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={handleRateCancel}
        >
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              maxWidth: 400,
              width: '100%',
              p: 3
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Update Exchange Rate
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2, textAlign: 'center' }}>
                Set Exchange Rate
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                    USD
                  </Typography>
                  <TextField
                    fullWidth
                    value="1.00"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                      }
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ color: '#4f4f4fb3', fontWeight: 600, mt: 3 }}>
                  =
                </Typography>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                    HTG
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="Enter rate"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: 'rgba(0, 168, 232, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00a8e8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00a8e8',
                        },
                      }
                    }}
                    inputProps={{
                      min: 0,
                      step: 0.01
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleRateCancel}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  '&:hover': {
                    borderColor: '#00a8e8',
                    background: 'rgba(0, 168, 232, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleRateSave}
                disabled={!newRate || isNaN(parseFloat(newRate)) || parseFloat(newRate) <= 0 || isUpdatingRate}
                sx={{
                  background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {isUpdatingRate ? 'Updating...' : 'Save'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  )
})

Dashboard.displayName = 'Dashboard'

export { Dashboard }
