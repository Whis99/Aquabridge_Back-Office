import React, { useState } from 'react'
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
  useMediaQuery
} from '@mui/material'
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon
} from '@mui/icons-material'

// Sample user data
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  avatar: 'JD'
}

// Sample recent activity data
const recentActivity = [
  {
    id: 1,
    action: 'Logged in',
    device: 'Chrome on Mac',
    location: 'San Francisco, CA',
    time: '2 hours ago',
    icon: ComputerIcon
  },
  {
    id: 2,
    action: 'Password changed',
    device: 'Chrome on Mac',
    location: 'San Francisco, CA',
    time: '1 day ago',
    icon: SecurityIcon
  },
  {
    id: 3,
    action: 'Profile updated',
    device: 'Safari on iPhone',
    location: 'San Francisco, CA',
    time: '3 days ago',
    icon: EditIcon
  },
  {
    id: 4,
    action: 'Logged in',
    device: 'Chrome on Mac',
    location: 'San Francisco, CA',
    time: '5 days ago',
    icon: ComputerIcon
  }
]

// Security settings options
const securitySettings = [
  {
    id: 1,
    title: 'Change Password',
    icon: SecurityIcon,
    color: '#00588be0'
  },
  {
    id: 2,
    title: 'Privacy Settings',
    icon: VisibilityIcon,
    color: '#00588be0'
  },
  {
    id: 3,
    title: 'Notification Preferences',
    icon: NotificationsIcon,
    color: '#00588be0'
  },
  {
    id: 4,
    title: 'Payment Methods',
    icon: CreditCardIcon,
    color: '#00588be0'
  }
]

export default function Profile() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [formData, setFormData] = useState(userData)
  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log('Profile saved:', formData)
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  const ActivityItem = ({ activity }) => (
    <ListItem sx={{ 
      px: 0, 
      py: 1.5,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(0, 88, 139, 0.1)',
          width: 32,
          height: 32
        }}>
          <activity.icon sx={{ color: '#00588be0', fontSize: 18 }} />
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
            {activity.action}
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
            {activity.device} • {activity.location}
          </Typography>
        }
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <AccessTimeIcon sx={{ fontSize: 14, color: '#4f4f4fb3' }} />
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.75rem' : '0.8rem'
          }}
        >
          {activity.time}
        </Typography>
      </Box>
    </ListItem>
  )

  const SecurityItem = ({ setting }) => (
    <ListItem sx={{ px: 0, py: 1 }}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<setting.icon sx={{ color: setting.color }} />}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: '#0e0e0eff',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
          {setting.title}
        </Typography>
      </Button>
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
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            color: '#00588be0', 
            fontWeight: 600,
            mb: 0.5
          }}
        >
          Profile Settings
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Manage your account settings and preferences
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
          <Box sx={{ mb: 3 }}>
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
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#4f4f4fb3',
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}
            >
              Update your personal information and profile details
            </Typography>
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
                  {formData.avatar}
                </Avatar>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#0e0e0eff',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    mb: 1,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 88, 139, 0.1)',
                      borderColor: '#00588be0'
                    }
                  }}
                >
                  Change Photo
                </Button>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#f44336',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.75rem' : '0.8rem'
                  }}
                >
                  Remove Photo
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
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 3,
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="outlined"
                  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
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
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                {isEditing && (
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
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity and Security Settings */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Recent Activity Section */}
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
                  Recent Activity
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4f4f4fb3',
                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                  }}
                >
                  Your recent account activity and logins
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings Section */}
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
                  Manage your account security and privacy
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {securitySettings.map((setting) => (
                  <SecurityItem key={setting.id} setting={setting} />
                ))}
                
                {/* Sign Out Button */}
                <ListItem sx={{ px: 0, py: 1, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon sx={{ color: '#f44336' }} />}
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
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      Sign Out
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
