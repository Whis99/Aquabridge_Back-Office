import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Download as DownloadIcon,
  Info as InfoIcon,
  PhoneAndroid as PhoneIcon,
  Security as SecurityIcon,
  InstallMobile as InstallIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'

const AppDownload = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [message, setMessage] = useState({ type: '', text: '' })

  // APK file path (stored in public folder)
  const apkFilePath = "/downloads/aquabridge-app-v1.0.0.apk"
  const apkFileName = "aquabridge-app-v1.0.0.apk"

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

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          sx={{
            background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          APK Download
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#666',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Download the Aquabridge mobile application for Android devices
        </Typography>
      </Box>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* Main Download Card */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 168, 232, 0.15)'
        }
      }}>
        <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          {/* App Icon */}
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 24px rgba(0, 168, 232, 0.3)'
          }}>
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700 }}>
              AB
            </Typography>
          </Box>

          {/* App Info */}
          <Typography
            variant="h4"
            sx={{
              color: '#333',
              fontWeight: 600,
              mb: 1
            }}
          >
            Aquabridge
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 3,
              fontSize: '1.1rem'
            }}
          >
            Glass Eel Supply Chain Management
          </Typography>

          {/* Download Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={isDownloading}
            sx={{
              background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
              borderRadius: 2,
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(0, 168, 232, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #004d6b 0%, #0077be 100%)',
                boxShadow: '0 12px 32px rgba(0, 168, 232, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666'
              },
              mb: 3
            }}
          >
            {isDownloading ? 'Downloading...' : 'Download APK'}
          </Button>

          {/* Download Progress */}
          {isDownloading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={downloadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 168, 232, 0.1)',
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)'
                  }
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500
                }}
              >
                {Math.round(downloadProgress)}% complete
              </Typography>
            </Box>
          )}

          {/* Version Info */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#999',
              fontSize: '0.9rem'
            }}
          >
            Version 1.0.0 • 65.9 MB • Android 7.0+
          </Typography>
        </CardContent>
      </Card>

      {/* Installation Walkthrough */}
      <Card sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        mt: 3
      }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <InstallIcon sx={{ color: '#00588be0', fontSize: 24 }} />
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                fontWeight: 600
              }}
            >
              Installation Guide
            </Typography>
          </Box>

          {/* Important Notice */}
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#00588be0'
              }
            }}
            icon={<InfoIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              <strong>Important:</strong> Since this is not downloaded from Google Play Store, you'll need to enable "Install from Unknown Sources" on your Android device.
            </Typography>
          </Alert>

          {/* Installation Steps */}
          <Accordion sx={{ 
            boxShadow: 'none',
            border: '1px solid rgba(0, 168, 232, 0.2)',
            borderRadius: 2,
            mb: 2,
            '&:before': { display: 'none' }
          }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#00588be0' }} />}
              sx={{
                backgroundColor: 'rgba(0, 168, 232, 0.05)',
                borderRadius: 2,
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0'
                }
              }}
            >
              <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                Step-by-Step Installation
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <List>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography sx={{ 
                      color: '#00588be0', 
                      fontWeight: 700, 
                      fontSize: '1.2rem',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 168, 232, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      1
                    </Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Enable Unknown Sources"
                    secondary="Go to Settings → Security → Install unknown apps → Allow from this source"
                    primaryTypographyProps={{ fontWeight: 600, color: '#333' }}
                    secondaryTypographyProps={{ color: '#666', fontSize: '0.9rem' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography sx={{ 
                      color: '#00588be0', 
                      fontWeight: 700, 
                      fontSize: '1.2rem',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 168, 232, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      2
                    </Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Download the APK"
                    secondary="Click the 'Download APK' button above and wait for download to complete"
                    primaryTypographyProps={{ fontWeight: 600, color: '#333' }}
                    secondaryTypographyProps={{ color: '#666', fontSize: '0.9rem' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography sx={{ 
                      color: '#00588be0', 
                      fontWeight: 700, 
                      fontSize: '1.2rem',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 168, 232, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      3
                    </Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Install the App"
                    secondary="Open your Downloads folder, tap the APK file, and follow the installation prompts"
                    primaryTypographyProps={{ fontWeight: 600, color: '#333' }}
                    secondaryTypographyProps={{ color: '#666', fontSize: '0.9rem' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Launch Aquabridge"
                    secondary="Find the Aquabridge app icon on your home screen and tap to launch"
                    primaryTypographyProps={{ fontWeight: 600, color: '#333' }}
                    secondaryTypographyProps={{ color: '#666', fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Security Notice */}
          <Alert 
            severity="success" 
            sx={{ 
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}
            icon={<SecurityIcon />}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              <strong>Security Note:</strong> This APK is digitally signed and verified. It's safe to install on your device.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  )
}

export default AppDownload
