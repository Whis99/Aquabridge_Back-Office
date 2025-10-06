import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Avatar,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material'
import {
  AccountBalance as WalletIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TaxIcon,
  Receipt as FeeIcon,
  AccountBalanceWallet as WithdrawalIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  ShoppingCart as ClientIcon
} from '@mui/icons-material'
import { 
  getAllWithdrawals, 
  getWithdrawalById,
  updateWithdrawalStatus,
  getAllWallets,
  getWalletByUserId,
  updateWalletBalance,
  getAllTransactions,
  getAllOrders
} from '../services/firebaseServices'

const Wallet = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState([])
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState({}) // To store user details by ID
  
  // Statistics
  const [totalTaxes, setTotalTaxes] = useState(0)
  const [totalFees, setTotalFees] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
  
  // Dialog states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [withdrawalDetailsOpen, setWithdrawalDetailsOpen] = useState(false)
  const [walletUpdateDialogOpen, setWalletUpdateDialogOpen] = useState(false)
  const [walletUpdateForm, setWalletUpdateForm] = useState({
    userId: '',
    amount: '',
    reason: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Helper to get role color
  const getRoleColor = (role) => {
    const colors = {
      fisherman: "#4caf50",
      association: "#2196f3",
      collection_center: "#ff9800",
      client: "#9c27b0",
      admin: "#757575",
      supervisor: "#757575"
    }
    return colors[role] || "#757575"
  }

  // Helper to get role icon
  const getRoleIcon = (role) => {
    const icons = {
      fisherman: PersonIcon,
      association: BusinessIcon,
      collection_center: StoreIcon,
      client: ClientIcon,
      admin: PersonIcon,
      supervisor: PersonIcon
    }
    return icons[role] || PersonIcon
  }

  // Helper to get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      approved: "#4caf50",
      rejected: "#f44336",
      processed: "#2196f3"
    }
    return colors[status] || "#757575"
  }

  // Fetch all data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [
          withdrawalsData,
          walletsData,
          transactionsData,
          ordersData
        ] = await Promise.all([
          getAllWithdrawals(),
          getAllWallets(),
          getAllTransactions(),
          getAllOrders()
        ])

        // Process withdrawals
        const withdrawalsList = withdrawalsData.docs ? 
          withdrawalsData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          withdrawalsData.map(doc => ({ id: doc.id || doc.withdrawal_id, ...doc }))
        setWithdrawals(withdrawalsList)

        // Process wallets
        const walletsList = walletsData.docs ?
          walletsData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          walletsData.map(doc => ({ id: doc.id, ...doc }))
        setWallets(walletsList)

        // Process transactions
        const transactionsList = transactionsData.docs ?
          transactionsData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          transactionsData.map(doc => ({ id: doc.id, ...doc }))
        setTransactions(transactionsList)

        // Process orders
        const ordersList = ordersData.docs ?
          ordersData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          ordersData.map(doc => ({ id: doc.id, ...doc }))
        setOrders(ordersList)

        // Calculate statistics
        calculateStatistics(transactionsList, ordersList, withdrawalsList)

      } catch (error) {
        console.error("Error fetching wallet data:", error)
        setMessage({ type: 'error', text: 'Failed to load wallet data.' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  // Calculate statistics
  const calculateStatistics = (transactionsList, ordersList, withdrawalsList) => {
    // Calculate total taxes from orders
    const totalTaxesAmount = ordersList.reduce((sum, order) => {
      return sum + (order.taxAmount || 0)
    }, 0)
    setTotalTaxes(totalTaxesAmount)

    // Calculate total fees from transactions
    const totalFeesAmount = transactionsList.reduce((sum, transaction) => {
      return sum + (transaction.feeAmount || 0)
    }, 0)
    setTotalFees(totalFeesAmount)

    // Calculate total withdrawals
    const totalWithdrawalsAmount = withdrawalsList.reduce((sum, withdrawal) => {
      return sum + (withdrawal.amount || 0)
    }, 0)
    setTotalWithdrawals(totalWithdrawalsAmount)

    // Calculate pending withdrawals count
    const pendingCount = withdrawalsList.filter(w => w.status === 'pending').length
    setPendingWithdrawals(pendingCount)
  }

  // Handle view withdrawal details
  const handleViewWithdrawalDetails = useCallback(async (withdrawalId) => {
    try {
      const result = await getWithdrawalById(withdrawalId)
      if (result.success) {
        setSelectedWithdrawal(result.data)
        setWithdrawalDetailsOpen(true)
      } else {
        setMessage({ type: 'error', text: result.message })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error fetching withdrawal details:", error)
      setMessage({ type: 'error', text: 'Failed to fetch withdrawal details.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }, [])

  // Handle withdrawal status update
  const handleWithdrawalStatusUpdate = useCallback(async (withdrawalId, newStatus) => {
    try {
      setIsUpdating(true)
      setMessage({ type: '', text: '' })

      const result = await updateWithdrawalStatus(withdrawalId, newStatus)
      
      if (result.success) {
        setMessage({ type: 'success', text: `Withdrawal ${newStatus} successfully` })
        
        // Refresh withdrawals data
        const withdrawalsData = await getAllWithdrawals()
        const withdrawalsList = withdrawalsData.docs ? 
          withdrawalsData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          withdrawalsData.map(doc => ({ id: doc.id || doc.withdrawal_id, ...doc }))
        setWithdrawals(withdrawalsList)
        
        // Recalculate statistics
        calculateStatistics(transactions, orders, withdrawalsList)
        
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      } else {
        setMessage({ type: 'error', text: result.message })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error)
      setMessage({ type: 'error', text: 'Failed to update withdrawal status.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setIsUpdating(false)
    }
  }, [transactions, orders])

  // Handle wallet balance update
  const handleWalletBalanceUpdate = useCallback(async () => {
    if (!walletUpdateForm.userId || !walletUpdateForm.amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return
    }

    try {
      setIsUpdating(true)
      setMessage({ type: '', text: '' })

      const result = await updateWalletBalance(
        walletUpdateForm.userId,
        parseFloat(walletUpdateForm.amount),
        walletUpdateForm.reason
      )
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Wallet balance updated successfully' })
        
        // Refresh wallets data
        const walletsData = await getAllWallets()
        const walletsList = walletsData.docs ?
          walletsData.docs.map(doc => ({ id: doc.id, ...doc.data() })) :
          walletsData.map(doc => ({ id: doc.id, ...doc }))
        setWallets(walletsList)
        
        setWalletUpdateDialogOpen(false)
        setWalletUpdateForm({ userId: '', amount: '', reason: '' })
        
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      } else {
        setMessage({ type: 'error', text: result.message })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error updating wallet balance:", error)
      setMessage({ type: 'error', text: 'Failed to update wallet balance.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setIsUpdating(false)
    }
  }, [walletUpdateForm])

  // StatCard Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
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
            color: color,
            fontSize: isMobile ? 16 : 20,
            opacity: 0.8
          }} />
        </Box>
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
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#4f4f4fb3',
              fontSize: '0.7rem'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 1, md: 1.5 }, textAlign: 'center' }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: '#00588be0',
            fontWeight: 600,
            mb: 0.5
          }}
        >
          Wallet Management
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Monitor taxes, fees, withdrawals, and manage user wallet balances
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total Taxes"
            value={`$${totalTaxes.toLocaleString()}`}
            icon={TaxIcon}
            color="#f44336"
            subtitle="From orders"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total Fees"
            value={`$${totalFees.toLocaleString()}`}
            icon={FeeIcon}
            color="#ff9800"
            subtitle="From transactions"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total Withdrawals"
            value={`$${totalWithdrawals.toLocaleString()}`}
            icon={WithdrawalIcon}
            color="#2196f3"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Pending Withdrawals"
            value={pendingWithdrawals.toString()}
            icon={WithdrawalIcon}
            color="#ff9800"
            subtitle="Awaiting approval"
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setWalletUpdateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
            }
          }}
        >
          Update Wallet Balance
        </Button>
      </Box>

      {/* Withdrawals Table */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              Withdrawal Requests ({withdrawals.length})
            </Typography>
          </Box>

          {withdrawals.length === 0 ? (
            <Alert severity="info">
              No withdrawal requests found.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Withdrawal ID</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>User ID</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Method</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#0e0e0eff' }}>
                        {withdrawal.withdrawal_id || withdrawal.id}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#0e0e0eff' }}>
                        {withdrawal.user_id}
                      </TableCell>
                      <TableCell sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                        ${(withdrawal.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#4f4f4fb3' }}>
                        {withdrawal.method || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={withdrawal.status || 'Unknown'}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(withdrawal.status)}20`,
                            color: getStatusColor(withdrawal.status),
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#4f4f4fb3', fontSize: '0.8rem' }}>
                        {formatDate(withdrawal.created_at)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewWithdrawalDetails(withdrawal.id)}
                          sx={{ color: '#2196f3' }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        {withdrawal.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleWithdrawalStatusUpdate(withdrawal.id, 'approved')}
                              sx={{ color: '#4caf50' }}
                              disabled={isUpdating}
                            >
                              <ApproveIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleWithdrawalStatusUpdate(withdrawal.id, 'rejected')}
                              sx={{ color: '#f44336' }}
                              disabled={isUpdating}
                            >
                              <RejectIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Details Dialog */}
      <Dialog open={withdrawalDetailsOpen} onClose={() => setWithdrawalDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)', color: '#ffffff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Withdrawal Details</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedWithdrawal && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#0e0e0eff' }}>Basic Information</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Withdrawal ID:</TableCell><TableCell sx={{ fontFamily: 'monospace' }}>{selectedWithdrawal.withdrawal_id || selectedWithdrawal.id}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>User ID:</TableCell><TableCell sx={{ fontFamily: 'monospace' }}>{selectedWithdrawal.user_id}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Amount:</TableCell><TableCell sx={{ color: '#0e0e0eff', fontWeight: 600 }}>${(selectedWithdrawal.amount || 0).toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Fee:</TableCell><TableCell>${(selectedWithdrawal.fee || 0).toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Total Amount:</TableCell><TableCell sx={{ color: '#0e0e0eff', fontWeight: 600 }}>${(selectedWithdrawal.total_amount || 0).toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Method:</TableCell><TableCell>{selectedWithdrawal.method || 'N/A'}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Status:</TableCell><TableCell>
                        <Chip
                          label={selectedWithdrawal.status || 'Unknown'}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(selectedWithdrawal.status)}20`,
                            color: getStatusColor(selectedWithdrawal.status),
                            fontWeight: 500
                          }}
                        />
                      </TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Created:</TableCell><TableCell>{formatDate(selectedWithdrawal.created_at)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              {selectedWithdrawal.account_details && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2, color: '#0e0e0eff' }}>Account Details</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow><TableCell sx={{ fontWeight: 500 }}>Account Holder:</TableCell><TableCell>{selectedWithdrawal.account_details.account_holder || 'N/A'}</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontWeight: 500 }}>Account Number:</TableCell><TableCell sx={{ fontFamily: 'monospace' }}>{selectedWithdrawal.account_details.account_number || 'N/A'}</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontWeight: 500 }}>Bank Address:</TableCell><TableCell>{selectedWithdrawal.account_details.bank_address || 'N/A'}</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2, color: '#0e0e0eff' }}>Additional Information</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Notes:</TableCell><TableCell>{selectedWithdrawal.notes || 'No notes'}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Transaction Reference:</TableCell><TableCell sx={{ fontFamily: 'monospace' }}>{selectedWithdrawal.transaction_reference || 'N/A'}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Approved At:</TableCell><TableCell>{formatDate(selectedWithdrawal.approved_at)}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Approved By:</TableCell><TableCell>{selectedWithdrawal.approved_by || 'N/A'}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Processed At:</TableCell><TableCell>{formatDate(selectedWithdrawal.processed_at)}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 500 }}>Rejection Reason:</TableCell><TableCell>{selectedWithdrawal.rejection_reason || 'N/A'}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWithdrawalDetailsOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Wallet Update Dialog */}
      <Dialog open={walletUpdateDialogOpen} onClose={() => setWalletUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: '#ffffff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Update Wallet Balance</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                value={walletUpdateForm.userId}
                onChange={(e) => setWalletUpdateForm(prev => ({ ...prev, userId: e.target.value }))}
                margin="normal"
                placeholder="Enter user custom ID (e.g., FIS-20250825-34408)"
                helperText="Enter the user's custom ID to update their wallet"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={walletUpdateForm.amount}
                onChange={(e) => setWalletUpdateForm(prev => ({ ...prev, amount: e.target.value }))}
                margin="normal"
                placeholder="Enter amount to add/subtract"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                helperText="Positive amount adds to balance, negative amount subtracts"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                value={walletUpdateForm.reason}
                onChange={(e) => setWalletUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                margin="normal"
                placeholder="Enter reason for balance update"
                multiline
                rows={3}
                helperText="Provide a reason for this wallet balance change"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWalletUpdateDialogOpen(false)} variant="outlined" disabled={isUpdating}>Cancel</Button>
          <Button onClick={handleWalletBalanceUpdate} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Balance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Wallet