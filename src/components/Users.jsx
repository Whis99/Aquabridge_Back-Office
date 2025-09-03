import React, { useState, useMemo } from 'react'
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
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

// Sample user data
const usersData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
    avatar: 'JD'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-14',
    avatar: 'SS'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Moderator',
    status: 'Inactive',
    lastLogin: '2024-01-10',
    avatar: 'MJ'
  },
  {
    id: 4,
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-15',
    avatar: 'EB'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'User',
    status: 'Pending',
    lastLogin: 'Never',
    avatar: 'DW'
  }
]

// Statistics data
const userStats = {
  totalUsers: { value: '2,350', change: '+12.5%', period: 'from last month', trend: 'up' },
  activeUsers: { value: '1,890', change: '+8.2%', period: 'from last month', trend: 'up' },
  newSignups: { value: '128', change: '+24.1%', period: 'this week', trend: 'up' },
  pending: { value: '23', change: '-2.1%', period: 'from last week', trend: 'down' }
}

export default function Users() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return usersData
    return usersData.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'secondary'
      case 'Moderator': return 'primary'
      case 'User': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'Pending': return 'warning'
      default: return 'default'
    }
  }

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
            User Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4f4f4fb3',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            Manage and monitor all registered users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{
            backgroundColor: '#00588be0',
            '&:hover': {
              backgroundColor: '#004d7a'
            },
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={userStats.totalUsers.value}
            change={userStats.totalUsers.change}
            period={userStats.totalUsers.period}
            trend={userStats.totalUsers.trend}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={userStats.activeUsers.value}
            change={userStats.activeUsers.change}
            period={userStats.activeUsers.period}
            trend={userStats.activeUsers.trend}
            icon={CheckCircleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Signups"
            value={userStats.newSignups.value}
            change={userStats.newSignups.change}
            period={userStats.newSignups.period}
            trend={userStats.newSignups.trend}
            icon={PersonAddIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={userStats.pending.value}
            change={userStats.pending.change}
            period={userStats.pending.period}
            trend={userStats.pending.trend}
            icon={ScheduleIcon}
          />
        </Grid>
      </Grid>

      {/* User List Section */}
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  color: '#0e0e0eff',
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                All Users
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#4f4f4fb3',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                A comprehensive list of all registered users
              </Typography>
            </Box>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 250 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 168, 232, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00588be0',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#0e0e0eff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#4f4f4fb3',
                  opacity: 1,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#4f4f4fb3', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Users Table */}
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    border: 'none', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    User
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    border: 'none', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    border: 'none', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    border: 'none', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    Last Login
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#0e0e0eff', 
                    border: 'none', 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 168, 232, 0.05)' } }}>
                    <TableCell sx={{ border: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: '#00588be0',
                          width: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40,
                          fontSize: isMobile ? '0.8rem' : '1rem',
                          fontWeight: 600
                        }}>
                          {user.avatar}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#0e0e0eff',
                              fontWeight: 500,
                              fontSize: isMobile ? '0.8rem' : '0.9rem'
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#4f4f4fb3',
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      <Chip 
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role)}
                        sx={{ 
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      <Chip 
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                        sx={{ 
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#0e0e0eff', 
                      border: 'none',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}>
                      {user.lastLogin}
                    </TableCell>
                    <TableCell sx={{ border: 'none' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                        sx={{ color: '#4f4f4fb3' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            minWidth: 150
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>
          Edit User
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>
          Reset Password
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.875rem', color: '#f44336' }}>
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  )
}
