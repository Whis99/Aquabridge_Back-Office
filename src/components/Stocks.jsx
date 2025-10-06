import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  ShoppingCart as ClientIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { 
  getAllStocks, 
  getEntityDetails 
} from '../services/firebaseServices'

const Stocks = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [stocks, setStocks] = useState([])
  const [entityDetails, setEntityDetails] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)
  const [stockDetailsOpen, setStockDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(5)

  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true)
        const stocksSnapshot = await getAllStocks()
        const stocksList = []
        const entityDetailsMap = {}

        // Process each stock document
        for (const stockDoc of stocksSnapshot.docs) {
          const stockData = {
            id: stockDoc.id, // This is the entity ID (ASC-20250825-18120, etc.)
            ...stockDoc.data()
          }
          stocksList.push(stockData)

          // Fetch entity details for this stock
          try {
            const entityResult = await getEntityDetails(stockDoc.id)
            if (entityResult.success) {
              entityDetailsMap[stockDoc.id] = entityResult.data
            }
          } catch (error) {
            console.error(`Error fetching entity details for ${stockDoc.id}:`, error)
          }
        }

        setStocks(stocksList)
        setEntityDetails(entityDetailsMap)
      } catch (error) {
        console.error("Error fetching stocks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStocks()
  }, [])

  // Calculate overall stock statistics
  const overallStats = useMemo(() => {
    const totalAlive = stocks.reduce((sum, stock) => sum + (stock.totalAlive || 0), 0)
    const totalDead = stocks.reduce((sum, stock) => sum + (stock.totalDead || 0), 0)
    const totalQty = stocks.reduce((sum, stock) => sum + (stock.totalQty || 0), 0)
    const totalEntities = stocks.length

    return {
      totalAlive,
      totalDead,
      totalQty,
      totalEntities
    }
  }, [stocks])

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    try {
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-US', {
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

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      fisherman: PersonIcon,
      association: BusinessIcon,
      collection_center: StoreIcon,
      client: ClientIcon
    }
    return icons[role] || PersonIcon
  }

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      fisherman: "#4caf50",
      association: "#2196f3", 
      collection_center: "#ff9800",
      client: "#9c27b0"
    }
    return colors[role] || "#757575"
  }

  // Handle view stock details
  const handleViewStockDetails = (stock) => {
    setSelectedStock(stock)
    setStockDetailsOpen(true)
  }

  // Pagination logic
  const totalPages = Math.ceil(stocks.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedStocks = stocks.slice(startIndex, endIndex)

  // Reset to first page when stocks change
  useEffect(() => {
    setCurrentPage(1)
  }, [stocks])

  // StatCard Component
  const StatCard = ({ title, value, icon: Icon, color = '#00588be0', subtitle }) => (
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
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.7rem' : '0.8rem'
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
          Stock Management
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Monitor glass eel inventory across all entities and collection centers
        </Typography>
      </Box>

      {/* Overall Stock Statistics */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard
            title="Total Alive"
            value={overallStats.totalAlive.toLocaleString()}
            icon={TrendingUpIcon}
            color="#4caf50"
            subtitle="count"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard
            title="Total Dead"
            value={overallStats.totalDead.toLocaleString()}
            icon={TrendingDownIcon}
            color="#f44336"
            subtitle="count"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard
            title="Total Quantity"
            value={`${overallStats.totalQty.toLocaleString()} kg`}
            icon={InventoryIcon}
            color="#2196f3"
            subtitle="kg"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <StatCard
            title="Total Entities"
            value={overallStats.totalEntities.toLocaleString()}
            icon={BusinessIcon}
            color="#ff9800"
            subtitle="With stock"
          />
        </Grid>
      </Grid>

      {/* Stock List Table */}
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              Entity Stock Inventory ({stocks.length})
            </Typography>
            <IconButton onClick={() => window.location.reload()} sx={{ color: '#00588be0' }}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {stocks.length === 0 ? (
            <Alert severity="info">
              No stock data found. Stock information will appear here once entities start managing inventory.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Entity ID</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Entity Name</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Alive</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Dead</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Total Qty (kg)</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Last Updated</TableCell>
                    <TableCell sx={{ color: '#4f4f4fb3', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStocks.map((stock) => {
                    const entity = entityDetails[stock.id]
                    const RoleIcon = entity ? getRoleIcon(entity.role) : PersonIcon
                    const roleColor = entity ? getRoleColor(entity.role) : '#757575'
                    
                    return (
                      <TableRow key={stock.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#0e0e0eff' }}>
                          {stock.id}
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff' }}>
                          {entity ? entity.name : 'Unknown Entity'}
                        </TableCell>
                        <TableCell>
                          {entity && (
                            <Chip
                              icon={<RoleIcon sx={{ fontSize: 16 }} />}
                              label={entity.role}
                              size="small"
                              sx={{
                                backgroundColor: `${roleColor}20`,
                                color: roleColor,
                                fontWeight: 500
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#4caf50', fontWeight: 600 }}>
                          {stock.totalAlive || 0}
                        </TableCell>
                        <TableCell sx={{ color: '#f44336', fontWeight: 600 }}>
                          {stock.totalDead || 0}
                        </TableCell>
                        <TableCell sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                          {(stock.totalQty || 0).toLocaleString()} kg
                        </TableCell>
                        <TableCell sx={{ color: '#4f4f4fb3', fontSize: '0.8rem' }}>
                          {formatDate(stock.lastUpdated)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewStockDetails(stock)}
                            sx={{ color: '#00588be0' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Pagination Controls */}
          {stocks.length > rowsPerPage && (
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
                Showing {startIndex + 1}-{Math.min(endIndex, stocks.length)} of {stocks.length} stocks
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  sx={{ color: '#00588be0' }}
                >
                  Previous
                </Button>
                
                <Typography variant="body2" sx={{ color: '#0e0e0eff', mx: 2 }}>
                  Page {currentPage} of {totalPages}
                </Typography>
                
                <Button
                  size="small"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  sx={{ color: '#00588be0' }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Stock Details Dialog */}
      <Dialog 
        open={stockDetailsOpen} 
        onClose={() => setStockDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
          Stock Details - {selectedStock?.id}
        </DialogTitle>
        <DialogContent>
          {selectedStock && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Total Alive
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {selectedStock.totalAlive || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Total Dead
                </Typography>
                <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600 }}>
                  {selectedStock.totalDead || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Total Quantity
                </Typography>
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                  {(selectedStock.totalQty || 0).toLocaleString()} kg
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ color: '#0e0e0eff' }}>
                  {formatDate(selectedStock.lastUpdated)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default Stocks