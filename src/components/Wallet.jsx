import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AttachMoney as AttachMoneyIcon,
  Savings as SavingsIcon
} from '@mui/icons-material'

// Sample transaction data
const transactionsData = [
  {
    id: 1,
    description: 'Salary Deposit',
    date: '2024-01-15',
    amount: 5000,
    type: 'income',
    category: 'Income'
  },
  {
    id: 2,
    description: 'Grocery Shopping',
    date: '2024-01-14',
    amount: -156.78,
    type: 'expense',
    category: 'Food'
  },
  {
    id: 3,
    description: 'Gas Station',
    date: '2024-01-14',
    amount: -45.5,
    type: 'expense',
    category: 'Transportation'
  },
  {
    id: 4,
    description: 'Freelance Payment',
    date: '2024-01-13',
    amount: 750,
    type: 'income',
    category: 'Income'
  },
  {
    id: 5,
    description: 'Netflix Subscription',
    date: '2024-01-12',
    amount: -15.99,
    type: 'expense',
    category: 'Entertainment'
  }
]

// Financial metrics data
const financialMetrics = {
  totalBalance: { 
    value: '$6,847.32', 
    change: '+12.5%', 
    period: 'from last month', 
    trend: 'up' 
  },
  monthlyIncome: { 
    value: '$5,750', 
    change: '+8.2%', 
    period: 'from last month', 
    trend: 'up' 
  },
  monthlyExpenses: { 
    value: '$3,245.67', 
    change: '+5.1%', 
    period: 'from last month', 
    trend: 'up' 
  },
  netSavings: { 
    value: '$2,504.33', 
    change: '+15.8%', 
    period: 'from last month', 
    trend: 'up' 
  }
}

export default function Wallet() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [transactions] = useState(transactionsData)

  const StatCard = ({ title, value, change, period, trend, icon: Icon }) => (
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
      </CardContent>
    </Card>
  )

  const TransactionItem = ({ transaction }) => (
    <ListItem sx={{ 
      px: 0, 
      py: 1.5,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Avatar sx={{ 
          bgcolor: transaction.type === 'income' ? '#4caf50' : '#f44336',
          width: 40,
          height: 40
        }}>
          {transaction.type === 'income' ? (
            <ArrowUpwardIcon sx={{ color: 'white', fontSize: 20 }} />
          ) : (
            <ArrowDownwardIcon sx={{ color: 'white', fontSize: 20 }} />
          )}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#0e0e0eff',
              fontWeight: 500,
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            {transaction.description}
          </Typography>
        }
        secondary={
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.75rem' : '0.8rem'
            }}
          >
            {transaction.date}
          </Typography>
        }
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Chip 
          label={transaction.category}
          size="small"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#0e0e0eff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            height: 20
          }}
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          color: transaction.type === 'income' ? '#4caf50' : '#f44336',
          fontWeight: 600,
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}
      >
        {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
      </Typography>
    </ListItem>
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: { xs: 2, md: 3 },
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
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
            Track your finances and manage your money
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RemoveIcon />}
            sx={{
              borderColor: '#00588be0',
              color: '#00588be0',
              '&:hover': {
                borderColor: '#004d7a',
                backgroundColor: 'rgba(0, 88, 139, 0.1)'
              },
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            Add Expense
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#00588be0',
              '&:hover': {
                backgroundColor: '#004d7a'
              },
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            Add Income
          </Button>
        </Box>
      </Box>

      {/* Financial Metrics Cards */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={financialMetrics.totalBalance.value}
            change={financialMetrics.totalBalance.change}
            period={financialMetrics.totalBalance.period}
            trend={financialMetrics.totalBalance.trend}
            icon={WalletIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={financialMetrics.monthlyIncome.value}
            change={financialMetrics.monthlyIncome.change}
            period={financialMetrics.monthlyIncome.period}
            trend={financialMetrics.monthlyIncome.trend}
            icon={TrendingUpIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={financialMetrics.monthlyExpenses.value}
            change={financialMetrics.monthlyExpenses.change}
            period={financialMetrics.monthlyExpenses.period}
            trend={financialMetrics.monthlyExpenses.trend}
            icon={TrendingDownIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Savings"
            value={financialMetrics.netSavings.value}
            change={financialMetrics.netSavings.change}
            period={financialMetrics.netSavings.period}
            trend={financialMetrics.netSavings.trend}
            icon={SavingsIcon}
          />
        </Grid>
      </Grid>

      {/* Recent Transactions Section */}
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0, 168, 232, 0.1)'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Section Header */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                color: '#0e0e0eff',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              Recent Transactions
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#4f4f4fb3',
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}
            >
              Your latest financial activity
            </Typography>
          </Box>

          {/* Transactions List */}
          <List sx={{ p: 0 }}>
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}