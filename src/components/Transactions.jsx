import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon
} from "@mui/icons-material"
import { 
  getAllTransactions, 
  getTransactionsByStatus, 
  getTransactionsByType 
} from "../services/firebaseServices"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from "recharts"

const Transactions = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("daily")
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [chartData, setChartData] = useState([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalQuantity: 0,
    averageAmount: 0
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(5)

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  // Filter options
  const statusOptions = [
    { value: "all", label: "All Status", color: "#757575" },
    { value: "pending", label: "Pending", color: "#ff9800" },
    { value: "approved", label: "Approved", color: "#4caf50" },
    { value: "completed", label: "Completed", color: "#2196f3" },
    { value: "cancelled", label: "Cancelled", color: "#f44336" }
  ]

  const typeOptions = [
    { value: "all", label: "All Types", color: "#757575" },
    { value: "coll_center_to_client", label: "Collection Center to Client", color: "#2196f3" },
    { value: "fisherman_to_coll_center", label: "Fisherman to Collection Center", color: "#4caf50" },
    { value: "association_to_coll_center", label: "Association to Collection Center", color: "#ff9800" }
  ]

  const timeOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ]

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const transactionsData = await getAllTransactions()
        const transactionsList = transactionsData.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTransactions(transactionsList)
        setFilteredTransactions(transactionsList)
        processChartData(transactionsList)
        calculateStats(transactionsList)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filter transactions
  useEffect(() => {
    let filtered = transactions

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.transaction_type === typeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.entity_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, statusFilter, typeFilter, searchTerm])

  // Process chart data
  const processChartData = (transactionsList) => {
    const dataMap = {}
    
    transactionsList.forEach(transaction => {
      const date = transaction.createdAt?.toDate()
      if (!date) return

      let key
      switch (timeFilter) {
        case "daily":
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          break
        case "weekly":
          const weekStart = new Date(date)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          break
        case "monthly":
          key = date.toLocaleDateString('en-US', { month: 'short' })
          break
        default:
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }

      if (!dataMap[key]) {
        dataMap[key] = {
          period: key,
          amount: 0,
          quantity: 0,
          count: 0
        }
      }

      dataMap[key].amount += transaction.totalCost || 0
      dataMap[key].quantity += transaction.totalQty || 0
      dataMap[key].count += 1
    })

    const chartData = Object.values(dataMap).sort((a, b) => {
      return new Date(a.period) - new Date(b.period)
    })

    setChartData(chartData)
  }

  // Calculate statistics
  const calculateStats = (transactionsList) => {
    const totalTransactions = transactionsList.length
    const totalAmount = transactionsList.reduce((sum, t) => sum + (t.totalCost || 0), 0)
    const totalQuantity = transactionsList.reduce((sum, t) => sum + (t.totalQty || 0), 0)
    const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    setStats({
      totalTransactions,
      totalAmount,
      totalQuantity,
      averageAmount
    })
  }

  // Update chart when time filter changes
  useEffect(() => {
    processChartData(transactions)
  }, [timeFilter, transactions])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    try {
      // Handle Firebase Timestamp object
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle regular Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle Unix timestamp (seconds)
      if (typeof timestamp === 'number') {
        const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle string timestamp
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return "Invalid Date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Handle transaction details
  const handleViewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setTransactionDetailsOpen(true)
  }

  // Get status color
  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status)
    return statusObj?.color || "#757575"
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <PendingIcon />
      case "approved": return <CheckIcon />
      case "completed": return <CheckIcon />
      case "cancelled": return <CancelIcon />
      default: return <ScheduleIcon />
    }
  }

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section - Matching Dashboard Style */}
      <Box sx={{ mb: { xs: 1, md: 1.5 }, textAlign: 'center' }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: '#00588be0',
            fontWeight: 600,
            mb: 0.5
          }}
        >
          Transaction Analytics
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Monitor transaction flows, analyze patterns, and track financial performance
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <ReceiptIcon sx={{ fontSize: 28, color: '#2196f3', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {stats.totalTransactions}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
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
                {formatCurrency(stats.totalAmount)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 28, color: '#ff9800', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {stats.totalQuantity.toFixed(1)} kg
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Total Quantity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <BarChartIcon sx={{ fontSize: 28, color: '#9c27b0', mb: 0.5 }} />
              <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
                {formatCurrency(stats.averageAmount)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem' }}>
                Average Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        {/* Transaction Volume Chart */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                    Transaction Volume Over Time
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mt: 0.5 }}>
                    Track transaction trends and volume patterns to identify peak periods and business insights
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={timeFilter}
                    label="Time Period"
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    {timeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="period" stroke="#4f4f4fb3" />
                    <YAxis stroke="#4f4f4fb3" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#00a8e8"
                      fill="rgba(0, 168, 232, 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Types Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 1 }}>
                Transaction Types Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2 }}>
                Breakdown of transaction types by volume
              </Typography>
              
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        transactions.reduce((acc, t) => {
                          acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1
                          return acc
                        }, {})
                      ).map(([type, count]) => ({ 
                        name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
                        value: count 
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(
                        transactions.reduce((acc, t) => {
                          acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1
                          return acc
                        }, {})
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: '#0e0e0eff', fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 1 }}>
                Transaction Status Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2 }}>
                Breakdown of transaction statuses
              </Typography>
              
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        transactions.reduce((acc, t) => {
                          acc[t.status] = (acc[t.status] || 0) + 1
                          return acc
                        }, {})
                      ).map(([status, count]) => ({ 
                        name: status.charAt(0).toUpperCase() + status.slice(1), 
                        value: count 
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(
                        transactions.reduce((acc, t) => {
                          acc[t.status] = (acc[t.status] || 0) + 1
                          return acc
                        }, {})
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 168, 232, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: '#0e0e0eff', fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              Transactions ({filteredTransactions.length})
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#4f4f4fb3' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {typeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {filteredTransactions.length === 0 ? (
            <Alert severity="info">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No transactions found matching your criteria." 
                : "No transactions found."
              }
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '25%' }}>Transaction ID</TableCell>
                    <TableCell sx={{ width: '15%' }}>Status</TableCell>
                    <TableCell sx={{ width: '20%' }}>Amount</TableCell>
                    <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                    <TableCell sx={{ width: '15%' }}>Created</TableCell>
                    <TableCell sx={{ width: '10%' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      hover
                      onClick={() => handleViewTransactionDetails(transaction)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {transaction.transaction_id}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(transaction.status)}
                          label={transaction.status?.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(transaction.status)}20`,
                            color: getStatusColor(transaction.status),
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {formatCurrency(transaction.totalCost)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.totalQty} kg</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTransactionDetails(transaction)
                          }}
                          sx={{
                            borderColor: 'rgba(0, 168, 232, 0.3)',
                            color: '#00a8e8',
                            fontSize: '0.7rem',
                            py: 0.5,
                            px: 1,
                            minWidth: 'auto',
                            '&:hover': {
                              borderColor: '#00a8e8',
                              background: 'rgba(0, 168, 232, 0.1)'
                            }
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTransactions.length > rowsPerPage && (
                <Box sx={{ 
                  p: 2, 
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      sx={{
                        borderColor: 'rgba(0, 168, 232, 0.3)',
                        color: '#00a8e8',
                        minWidth: 'auto',
                        px: 2,
                        '&:hover': {
                          borderColor: '#00a8e8',
                          background: 'rgba(0, 168, 232, 0.1)'
                        },
                        '&:disabled': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          color: 'rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      Previous
                    </Button>
                    
                    <Typography variant="body2" sx={{ color: '#0e0e0eff', px: 2 }}>
                      Page {currentPage} of {totalPages}
                    </Typography>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      sx={{
                        borderColor: 'rgba(0, 168, 232, 0.3)',
                        color: '#00a8e8',
                        minWidth: 'auto',
                        px: 2,
                        '&:hover': {
                          borderColor: '#00a8e8',
                          background: 'rgba(0, 168, 232, 0.1)'
                        },
                        '&:disabled': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          color: 'rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog
        open={transactionDetailsOpen}
        onClose={() => setTransactionDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #00a8e8 0%, #0077b6 100%)',
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              <ReceiptIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Transaction Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedTransaction?.transaction_id}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedTransaction && (
            <Box>
              {/* Basic Information Section */}
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ 
                  color: '#00a8e8', 
                  fontWeight: 600, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    backgroundColor: '#00a8e8',
                    borderRadius: 1
                  }} />
                  Transaction Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Transaction ID
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#00a8e8'
                      }}>
                        {selectedTransaction.transaction_id}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedTransaction.description}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Transaction Type
                      </Typography>
                      <Chip
                        label={selectedTransaction.transaction_type?.replace(/_/g, ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(selectedTransaction.transaction_type)}20`,
                          color: getStatusColor(selectedTransaction.transaction_type),
                          fontWeight: 600,
                          border: `1px solid ${getStatusColor(selectedTransaction.transaction_type)}40`
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Status
                      </Typography>
                      <Chip
                        icon={getStatusIcon(selectedTransaction.status)}
                        label={selectedTransaction.status?.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(selectedTransaction.status)}20`,
                          color: getStatusColor(selectedTransaction.status),
                          fontWeight: 600,
                          border: `1px solid ${getStatusColor(selectedTransaction.status)}40`
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Total Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#00a8e8' }}>
                        {formatCurrency(selectedTransaction.totalCost)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Quantity
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedTransaction.totalQty} kg
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Price Per Kg
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(selectedTransaction.pricePerKg)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Net Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(selectedTransaction.netAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Tax Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(selectedTransaction.taxAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Tax Rate
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {(selectedTransaction.taxRate * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Created At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedTransaction.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Account ID
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 500
                      }}>
                        {selectedTransaction.account_id}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Entity ID
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 500
                      }}>
                        {selectedTransaction.entity_id}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Button 
            onClick={() => setTransactionDetailsOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0, 168, 232, 0.3)',
              color: '#00a8e8',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#00a8e8',
                background: 'rgba(0, 168, 232, 0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Transactions
