import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  Download as DownloadIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  NewReleases as NewReleaseIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

const AppDownload = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // App version information
  const currentVersion = {
    version: "1.2.0",
    build: "20250103",
    releaseDate: "January 3, 2025",
    fileSize: "12.4 MB",
    minAndroidVersion: "7.0 (API 24)",
    downloadCount: 1247
  }

  // Version history
  const versionHistory = [
    {
      version: "1.2.0",
      date: "January 3, 2025",
      changes: [
        "Enhanced user authentication",
        "Improved offline functionality",
        "Bug fixes for wallet transactions",
        "UI/UX improvements"
      ],
      type: "major"
    },
    {
      version: "1.1.5",
      date: "December 20, 2024",
      changes: [
        "Fixed crash on order submission",
        "Improved sync performance",
        "Updated security protocols"
      ],
      type: "patch"
    },
    {
      version: "1.1.0",
      date: "December 10, 2024",
      changes: [
        "Added wallet management features",
        "Enhanced stock tracking",
        "New notification system"
      ],
      type: "minor"
    }
  ]

  // APK file path (stored in public folder)
  const apkFilePath = "/downloads/aquabridge-app-v1.2.0.apk"
  const apkFileName = "aquabridge-app-v1.2.0.apk"

  // Handle APK download
  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      setDownloadProgress(0)
      setMessage({ type: '', text: '' })

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Create download link
      const link = document.createElement('a')
      link.href = apkFilePath
      link.download = apkFileName
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Complete progress
      setTimeout(() => {
        setDownloadProgress(100)
        setIsDownloading(false)
        setMessage({ 
          type: 'success', 
          text: 'APK download started successfully! Check your downloads folder.' 
        })
        
        // Reset progress after 3 seconds
        setTimeout(() => {
          setDownloadProgress(0)
        }, 3000)
      }, 1000)

    } catch (error) {
      console.error('Download error:', error)
      setIsDownloading(false)
      setDownloadProgress(0)
      setMessage({ 
        type: 'error', 
        text: 'Failed to start download. Please try again or contact support.' 
      })
    }
  }

  // Get version type color
  const getVersionTypeColor = (type) => {
    switch (type) {
      case 'major': return '#f44336'
      case 'minor': return '#ff9800'
      case 'patch': return '#4caf50'
      default: return '#757575'
    }
  }

  // Get version type label
  const getVersionTypeLabel = (type) => {
    switch (type) {
      case 'major': return 'Major Update'
      case 'minor': return 'Minor Update'
      case 'patch': return 'Bug Fix'
      default: return 'Update'
    }
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
          Aquabridge Mobile App
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#4f4f4fb3',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          Download the latest version of the Aquabridge mobile application
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Main Download Card */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        mb: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* App Info */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                    AB
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 0.5 }}>
                    Aquabridge
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                    Glass Eel Supply Chain Management
                  </Typography>
                </Box>
              </Box>

              {/* Version Info */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 0.5 }}>Version</Typography>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                    {currentVersion.version}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 0.5 }}>Build</Typography>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                    {currentVersion.build}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 0.5 }}>Size</Typography>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                    {currentVersion.fileSize}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 0.5 }}>Downloads</Typography>
                  <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                    {currentVersion.downloadCount.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Requirements */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon sx={{ color: '#4f4f4fb3', fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                  Requires Android {currentVersion.minAndroidVersion} or higher
                </Typography>
              </Box>
            </Grid>

            {/* Download Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={isDownloading}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    },
                    py: 1.5,
                    px: 3,
                    mb: 2
                  }}
                >
                  {isDownloading ? 'Downloading...' : 'Download APK'}
                </Button>

                {/* Download Progress */}
                {isDownloading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={downloadProgress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#4f4f4fb3', mt: 1, display: 'block' }}>
                      {Math.round(downloadProgress)}% complete
                    </Typography>
                  </Box>
                )}

                <Typography variant="caption" sx={{ color: '#4f4f4fb3', display: 'block' }}>
                  Released on {currentVersion.releaseDate}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Features and Info Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                End-to-end encryption, secure authentication, and regular security updates to protect your data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SpeedIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                  Performance
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                Optimized for speed and efficiency with offline capabilities and real-time sync.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BugReportIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                  Support
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                24/7 technical support and regular updates to ensure the best user experience.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Version History Section */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              Version History
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={() => setShowVersionHistory(true)}
              sx={{
                borderColor: 'rgba(0, 168, 232, 0.3)',
                color: '#00a8e8',
                '&:hover': {
                  borderColor: '#00a8e8',
                  background: 'rgba(0, 168, 232, 0.1)'
                }
              }}
            >
              View All
            </Button>
          </Box>

          {/* Latest Version Preview */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={getVersionTypeLabel(versionHistory[0].type)}
              size="small"
              sx={{
                backgroundColor: `${getVersionTypeColor(versionHistory[0].type)}20`,
                color: getVersionTypeColor(versionHistory[0].type),
                fontWeight: 500
              }}
            />
            <Typography variant="body1" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              v{versionHistory[0].version}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
              {versionHistory[0].date}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2 }}>
            Latest changes:
          </Typography>
          <List dense>
            {versionHistory[0].changes.slice(0, 3).map((change, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 20 }}>
                  <CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={change}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { color: '#0e0e0eff' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onClose={() => setShowVersionHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)', color: '#ffffff', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Version History</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {versionHistory.map((version, index) => (
            <Box key={version.version}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip
                  label={getVersionTypeLabel(version.type)}
                  size="small"
                  sx={{
                    backgroundColor: `${getVersionTypeColor(version.type)}20`,
                    color: getVersionTypeColor(version.type),
                    fontWeight: 500
                  }}
                />
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                  v{version.version}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3' }}>
                  {version.date}
                </Typography>
              </Box>
              <List dense>
                {version.changes.map((change, changeIndex) => (
                  <ListItem key={changeIndex} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={change}
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        sx: { color: '#0e0e0eff' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              {index < versionHistory.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowVersionHistory(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AppDownload
