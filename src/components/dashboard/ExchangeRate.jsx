import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { updateExchangeRate } from '../../services/firebaseServices'

const ExchangeRate = ({ exchangeRate, onRateUpdate }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [showRatePopup, setShowRatePopup] = useState(false)
  const [newRate, setNewRate] = useState('')
  const [rateMessage, setRateMessage] = useState({ type: '', text: '' })
  const [isUpdatingRate, setIsUpdatingRate] = useState(false)

  const handleRateEdit = useCallback(() => {
    setNewRate(exchangeRate.toString())
    setShowRatePopup(true)
  }, [exchangeRate])

  const handleRateSave = useCallback(async () => {
    const rate = parseFloat(newRate)
    if (!isNaN(rate) && rate > 0) {
      try {
        setIsUpdatingRate(true)
        setRateMessage({ type: '', text: '' })
        
        const result = await updateExchangeRate(rate)
        
        if (result.success) {
          onRateUpdate(rate)
          setShowRatePopup(false)
          setNewRate('')
          setRateMessage({ type: 'success', text: 'Exchange rate updated successfully' })
          setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
        } else {
          setRateMessage({ type: 'error', text: result.message })
          setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
        }
      } catch (error) {
        console.error("Error updating exchange rate:", error)
        setRateMessage({ type: 'error', text: 'Failed to update exchange rate' })
        setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
      } finally {
        setIsUpdatingRate(false)
      }
    }
  }, [newRate, onRateUpdate])

  const handleRateCancel = useCallback(() => {
    setShowRatePopup(false)
    setNewRate('')
  }, [])

  return (
    <>
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(0, 168, 232, 0.2)'
        }
      }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          {/* Rate Messages */}
          {rateMessage.text && (
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: rateMessage.type === 'success' ? '#4caf50' : '#f44336',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
              >
                {rateMessage.text}
              </Typography>
            </Box>
          )}
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5
          }}>
            <Typography
              variant="body2"
              sx={{
                color: '#0e0e0eff',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Exchange Rate
            </Typography>
            <IconButton 
              size="small"
              onClick={handleRateEdit}
              sx={{
                color: '#00588be0',
                '&:hover': {
                  backgroundColor: 'rgba(0, 88, 139, 0.1)'
                }
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 1 }}>
                USD to HTG
              </Typography>
              <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 700, fontSize: '1rem' }}>
                1 USD = {exchangeRate.toFixed(2)} HTG
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 0.5 }}>
                Last Updated
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem' }}>
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Exchange Rate Edit Popup */}
      {showRatePopup && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={handleRateCancel}
        >
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              maxWidth: 400,
              width: '100%',
              p: 3
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Update Exchange Rate
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2, textAlign: 'center' }}>
                Set the current USD to HTG exchange rate
              </Typography>
              
              <TextField
                fullWidth
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Enter exchange rate"
                InputProps={{
                  startAdornment: <InputAdornment position="start">1 USD =</InputAdornment>,
                  endAdornment: <InputAdornment position="end">HTG</InputAdornment>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(0, 168, 232, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00a8e8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00a8e8',
                    },
                  }
                }}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleRateCancel}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  '&:hover': {
                    borderColor: '#00a8e8',
                    background: 'rgba(0, 168, 232, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleRateSave}
                disabled={!newRate || isNaN(parseFloat(newRate)) || parseFloat(newRate) <= 0 || isUpdatingRate}
                sx={{
                  background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00a8e8 0%, #0077be 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {isUpdatingRate ? 'Updating...' : 'Save'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </>
  )
}

export default ExchangeRate
