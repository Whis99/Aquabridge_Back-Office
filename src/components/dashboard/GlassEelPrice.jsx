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
import { createEelPrice } from '../../services/firebaseServices'

const GlassEelPrice = ({ activeEelPrice, onPriceUpdate }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [showEelPricePopup, setShowEelPricePopup] = useState(false)
  const [eelPriceForm, setEelPriceForm] = useState({
    pricePerKg: '',
    currency: 'USD',
    notes: ''
  })
  const [isUpdatingEelPrice, setIsUpdatingEelPrice] = useState(false)
  const [eelPriceMessage, setEelPriceMessage] = useState({ type: '', text: '' })

  const handleEelPriceEdit = useCallback(() => {
    if (activeEelPrice) {
      setEelPriceForm({
        pricePerKg: activeEelPrice.pricePerKg.toString(),
        currency: activeEelPrice.currency,
        notes: activeEelPrice.notes || ''
      })
    }
    setShowEelPricePopup(true)
  }, [activeEelPrice])

  const handleEelPriceSave = useCallback(async () => {
    const pricePerKg = parseFloat(eelPriceForm.pricePerKg)
    if (!isNaN(pricePerKg) && pricePerKg > 0) {
      try {
        setIsUpdatingEelPrice(true)
        setEelPriceMessage({ type: '', text: '' })
        
        const result = await createEelPrice({
          pricePerKg: pricePerKg,
          currency: eelPriceForm.currency,
          notes: eelPriceForm.notes,
          isActive: true
        })
        
        if (result.success) {
          onPriceUpdate(result.data)
          setShowEelPricePopup(false)
          setEelPriceForm({ pricePerKg: '', currency: 'USD', notes: '' })
          setEelPriceMessage({ type: 'success', text: 'Eel price updated successfully' })
          setTimeout(() => setEelPriceMessage({ type: '', text: '' }), 5000)
        } else {
          setEelPriceMessage({ type: 'error', text: result.message })
          setTimeout(() => setEelPriceMessage({ type: '', text: '' }), 5000)
        }
      } catch (error) {
        console.error("Error updating eel price:", error)
        setEelPriceMessage({ type: 'error', text: 'Failed to update eel price' })
        setTimeout(() => setEelPriceMessage({ type: '', text: '' }), 5000)
      } finally {
        setIsUpdatingEelPrice(false)
      }
    }
  }, [eelPriceForm, onPriceUpdate])

  const handleEelPriceCancel = useCallback(() => {
    setShowEelPricePopup(false)
    setEelPriceForm({ pricePerKg: '', currency: 'USD', notes: '' })
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
          {/* Eel Price Messages */}
          {eelPriceMessage.text && (
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: eelPriceMessage.type === 'success' ? '#4caf50' : '#f44336',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
              >
                {eelPriceMessage.text}
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
              Glass Eel Prices
            </Typography>
            <IconButton 
              size="small"
              onClick={handleEelPriceEdit}
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

          {activeEelPrice ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 1 }}>
                  Price per kg
                </Typography>
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 700, fontSize: '1rem' }}>
                  ${activeEelPrice.pricePerKg.toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 1 }}>
                  Price per gram
                </Typography>
                <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 700, fontSize: '1rem' }}>
                  ${activeEelPrice.pricePerGram.toFixed(4)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 0.5 }}>
                  Currency
                </Typography>
                <Typography variant="body2" sx={{ color: '#0e0e0eff', fontWeight: 600, fontSize: '0.8rem' }}>
                  {activeEelPrice.currency}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', fontSize: '0.75rem', mb: 0.5 }}>
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem' }}>
                  {activeEelPrice.updatedAt ? 
                    new Date(activeEelPrice.updatedAt.toDate ? activeEelPrice.updatedAt.toDate() : activeEelPrice.updatedAt).toLocaleDateString() : 
                    'N/A'
                  }
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                No eel price set
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleEelPriceEdit}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  fontSize: '0.7rem',
                  py: 0.5,
                  px: 2
                }}
              >
                Set Price
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Eel Price Edit Popup */}
      {showEelPricePopup && (
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
          onClick={handleEelPriceCancel}
        >
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              maxWidth: 500,
              width: '100%',
              p: 3
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Update Glass Eel Price
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 2, textAlign: 'center' }}>
                Set the current glass eel price per kilogram
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Price per Kilogram
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={eelPriceForm.pricePerKg}
                  onChange={(e) => setEelPriceForm(prev => ({ ...prev, pricePerKg: e.target.value }))}
                  placeholder="Enter price per kg"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
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

              {eelPriceForm.pricePerKg && !isNaN(parseFloat(eelPriceForm.pricePerKg)) && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 168, 232, 0.1)', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                    Calculated Price per Gram:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#00a8e8', fontWeight: 600 }}>
                    ${(parseFloat(eelPriceForm.pricePerKg) / 1000).toFixed(4)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Currency
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={eelPriceForm.currency}
                  onChange={(e) => setEelPriceForm(prev => ({ ...prev, currency: e.target.value }))}
                  SelectProps={{
                    native: true,
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
                >
                  <option value="USD">USD</option>
                  <option value="HTG">HTG</option>
                </TextField>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                  Notes (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={eelPriceForm.notes}
                  onChange={(e) => setEelPriceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this price change..."
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
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleEelPriceCancel}
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
                onClick={handleEelPriceSave}
                disabled={!eelPriceForm.pricePerKg || isNaN(parseFloat(eelPriceForm.pricePerKg)) || parseFloat(eelPriceForm.pricePerKg) <= 0 || isUpdatingEelPrice}
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
                {isUpdatingEelPrice ? 'Updating...' : 'Update Price'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </>
  )
}

export default GlassEelPrice
