import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function Profile() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          // Get user data from Firestore
          const userRef = doc(db, 'users', currentUser.uid)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            const userData = userSnap.data()
            setUserData(userData)
            setFormData({
              firstName: userData.name?.split(' ')[0] || '',
              lastName: userData.name?.split(' ').slice(1).join(' ') || '',
              email: userData.email || currentUser.email,
              phone: userData.phone || '',
              location: userData.location || '',
              role: userData.role || 'admin'
            })
          } else {
            // Fallback to auth user data
            setUserData({
              name: currentUser.displayName || 'Admin User',
              email: currentUser.email,
              role: 'admin'
            })
            setFormData({
              firstName: currentUser.displayName?.split(' ')[0] || 'Admin',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || 'User',
              email: currentUser.email,
              phone: '',
              location: '',
              role: 'admin'
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to auth user data
          setUserData({
            name: currentUser.displayName || 'Admin User',
            email: currentUser.email,
            role: 'admin'
          })
          setFormData({
            firstName: currentUser.displayName?.split(' ')[0] || 'Admin',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || 'User',
            email: currentUser.email,
            phone: '',
            location: '',
            role: 'admin'
          })
        }
      } else {
        // User not logged in, redirect to login
        navigate('/')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log('Profile saved:', formData)
    // Here you would typically update the user data in Firestore
  }

  const handleCancel = () => {
    setFormData({
      firstName: userData?.name?.split(' ')[0] || '',
      lastName: userData?.name?.split(' ').slice(1).join(' ') || '',
      email: userData?.email || user?.email,
      phone: userData?.phone || '',
      location: userData?.location || '',
      role: userData?.role || 'admin'
    })
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsLoggingOut(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return timestamp.toDate().toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Alert severity="error">User not found. Please log in again.</Alert>
      </Box>
    )
  }

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
          Admin Profile
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Manage your admin account settings
        </Typography>
      </Box>

      {/* Profile Information Section */}
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        mb: { xs: 3, md: 4 },
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0, 168, 232, 0.1)'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Section Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                color: '#0e0e0eff',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              Profile Information
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
              size="small"
              sx={{
                borderColor: 'rgba(0, 168, 232, 0.3)',
                color: '#00a8e8',
                '&:hover': {
                  borderColor: '#00a8e8',
                  background: 'rgba(0, 168, 232, 0.1)'
                }
              }}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </Box>

          {/* Profile Content */}
          <Grid container spacing={3}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: '#00588be0',
                  width: isMobile ? 80 : 120,
                  height: isMobile ? 80 : 120,
                  fontSize: isMobile ? '2rem' : '3rem',
                  fontWeight: 600,
                  mb: 2
                }}>
                  {getInitials(formData.firstName, formData.lastName)}
                </Avatar>
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, textAlign: 'center' }}>
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', textAlign: 'center' }}>
                  {formData.role?.toUpperCase()}
                </Typography>
              </Box>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: '#4f4f4fb3', mr: 1 }} />
                    }}
                    sx={{
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
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#4f4f4fb3',
                      },
                      '& .MuiInputBase-input': {
                        color: '#0e0e0eff',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: '#4f4f4fb3', mr: 1 }} />
                    }}
                    sx={{
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
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#4f4f4fb3',
                      },
                      '& .MuiInputBase-input': {
                        color: '#0e0e0eff',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: '#4f4f4fb3', mr: 1 }} />
                    }}
                    sx={{
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
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#4f4f4fb3',
                      },
                      '& .MuiInputBase-input': {
                        color: '#0e0e0eff',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: '#4f4f4fb3', mr: 1 }} />
                    }}
                    sx={{
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
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#4f4f4fb3',
                      },
                      '& .MuiInputBase-input': {
                        color: '#0e0e0eff',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ color: '#4f4f4fb3', mr: 1 }} />
                    }}
                    sx={{
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
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#4f4f4fb3',
                      },
                      '& .MuiInputBase-input': {
                        color: '#0e0e0eff',
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              {isEditing && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 3,
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#0e0e0eff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                      backgroundColor: '#00588be0',
                      '&:hover': {
                        backgroundColor: '#004d7a'
                      },
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Account Information & Security */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Account Information */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            height: '100%',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.1)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  Account Information
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4f4f4fb3',
                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                  }}
                >
                  Your account details and activity
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <AdminIcon sx={{ color: '#00588be0' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary={formData.role?.toUpperCase() || 'ADMIN'}
                    primaryTypographyProps={{ color: '#0e0e0eff', fontWeight: 500 }}
                    secondaryTypographyProps={{ color: '#4f4f4fb3' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <ComputerIcon sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Login"
                    secondary={user?.metadata?.lastSignInTime ? 
                      new Date(user.metadata.lastSignInTime).toLocaleString() : 
                      'N/A'
                    }
                    primaryTypographyProps={{ color: '#0e0e0eff', fontWeight: 500 }}
                    secondaryTypographyProps={{ color: '#4f4f4fb3' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <AccessTimeIcon sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Created"
                    secondary={user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'N/A'
                    }
                    primaryTypographyProps={{ color: '#0e0e0eff', fontWeight: 500 }}
                    secondaryTypographyProps={{ color: '#4f4f4fb3' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            height: '100%',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(0, 168, 232, 0.1)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    color: '#0e0e0eff',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  Security Settings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4f4f4fb3',
                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                  }}
                >
                  Manage your account security
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SecurityIcon sx={{ color: '#00588be0' }} />}
                    sx={{
                      borderColor: 'rgba(0, 88, 139, 0.3)',
                      color: '#00588be0',
                      backgroundColor: 'rgba(0, 88, 139, 0.05)',
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 88, 139, 0.1)',
                        borderColor: '#00588be0'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      Change Password
                    </Typography>
                  </Button>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                {/* Sign Out Button */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={isLoggingOut ? <CircularProgress size={20} /> : <LogoutIcon sx={{ color: '#f44336' }} />}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    sx={{
                      borderColor: 'rgba(244, 67, 54, 0.3)',
                      color: '#f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.05)',
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderColor: '#f44336'
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(244, 67, 54, 0.05)',
                        color: 'rgba(244, 67, 54, 0.5)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </Typography>
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}