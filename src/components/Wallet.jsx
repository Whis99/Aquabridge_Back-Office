import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider
} from '@mui/material'
import {
  AccountBalance as WalletIcon,
  AccountBalanceWallet as AquaBridgeIcon,
  Gavel as GovernmentIcon
} from '@mui/icons-material'
import { getWalletByUserId } from '../services/firebaseServices'

const Wallet = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [aquaBridgeWallet, setAquaBridgeWallet] = useState(null)
  const [governmentWallet, setGovernmentWallet] = useState(null)
  const [error, setError] = useState(null)

  // Fetch wallet data
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch both wallets in parallel
        const [aquaBridgeResult, governmentResult] = await Promise.all([
          getWalletByUserId('aquabridge_wallet'),
          getWalletByUserId('government_wallet')
        ])

        if (aquaBridgeResult.success) {
          setAquaBridgeWallet(aquaBridgeResult.data)
        } else {
          console.error('Failed to fetch AquaBridge wallet:', aquaBridgeResult.message)
        }

        if (governmentResult.success) {
          setGovernmentWallet(governmentResult.data)
        } else {
          console.error('Failed to fetch Government wallet:', governmentResult.message)
        }

      } catch (error) {
        console.error("Error fetching wallets:", error)
        setError('Failed to load wallet data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallets()
  }, [])

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

  // Helper to format currency
  const formatCurrency = (amount, currency = 'HTG') => {
    if (amount === null || amount === undefined) return '0.00'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Wallet Card Component
  const WalletCard = ({ wallet, title, description, icon: Icon, color, gradient }) => {
    if (!wallet) return null

    return (
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}40`
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: color,
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                boxShadow: `0 4px 20px ${color}40`
              }}>
                <Icon sx={{ fontSize: { xs: 24, md: 28 } }} />
              </Avatar>
              <Box>
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
                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={wallet.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                backgroundColor: wallet.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                color: wallet.isActive ? '#4caf50' : '#9e9e9e',
                fontWeight: 600,
                border: wallet.isActive ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(158, 158, 158, 0.3)'
              }}
            />
          </Box>

          {/* Balance Section */}
          <Box sx={{ 
            mb: 3,
            p: 2.5,
            background: gradient,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: `0 4px 20px ${color}20`
          }}>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 1,
                display: 'block'
              }}
            >
              Total Balance
            </Typography>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {formatCurrency(wallet.totalBalance)} {wallet.currency || 'HTG'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4f4f4fb3',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Wallet ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                  }}
                >
                  {wallet.walletId || wallet.id}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4f4f4fb3',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Currency
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                  }}
                >
                  {wallet.currency || 'HTG'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4f4f4fb3',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Created
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0e0e0eff',
                    fontSize: isMobile ? '0.7rem' : '0.8rem'
                  }}
                >
                  {formatDate(wallet.createdAt)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4f4f4fb3',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Last Updated
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0e0e0eff',
                    fontSize: isMobile ? '0.7rem' : '0.8rem'
                  }}
                >
                  {formatDate(wallet.lastUpdated)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
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
          Monitor and manage system wallets
        </Typography>
      </Box>

      {/* Wallets Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          <WalletCard
            wallet={aquaBridgeWallet}
            title="AquaBridge Wallet"
            description={aquaBridgeWallet?.description || "AquaBridge fee collection wallet"}
            icon={AquaBridgeIcon}
            color="#00a8e8"
            gradient="linear-gradient(135deg, #00a8e8 0%, #0077b6 100%)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <WalletCard
            wallet={governmentWallet}
            title="Government Wallet"
            description={governmentWallet?.description || "Government tax collection wallet"}
            icon={GovernmentIcon}
            color="#f44336"
            gradient="linear-gradient(135deg, #f44336 0%, #c62828 100%)"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Wallet
