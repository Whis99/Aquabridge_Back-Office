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
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { updateAllBenefitSettings } from '../../services/firebaseServices'

const BenefitSettings = ({ benefitSettings, onSettingsUpdate }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [showBenefitPopup, setShowBenefitPopup] = useState(false)
  const [benefitForm, setBenefitForm] = useState({
    fisherman: { profileName: 'Fisherman', basedOn: 'perKg', benefitType: 'fixed', value: 50, currency: 'HTG' },
    association: { profileName: 'Association', basedOn: 'total', benefitType: 'percentage', value: 10, currency: 'HTG' },
    collection_center: { profileName: 'Collection Center', basedOn: 'total', benefitType: 'percentage', value: 15, currency: 'HTG' },
    client: { profileName: 'Client', basedOn: 'perKg', benefitType: 'fixed', value: 100, currency: 'HTG' }
  })
  const [isUpdatingBenefits, setIsUpdatingBenefits] = useState(false)
  const [benefitMessage, setBenefitMessage] = useState({ type: '', text: '' })

  const handleBenefitEdit = useCallback(() => {
    // Initialize form with current settings
    const updatedForm = { ...benefitForm }
    Object.keys(benefitSettings).forEach(role => {
      const setting = benefitSettings[role]
      updatedForm[role] = {
        profileName: setting.profileName,
        basedOn: setting.basedOn,
        benefitType: setting.benefitType,
        value: setting.value,
        currency: setting.currency
      }
    })
    setBenefitForm(updatedForm)
    setShowBenefitPopup(true)
  }, [benefitSettings, benefitForm])

  const handleBenefitSave = useCallback(async () => {
    try {
      setIsUpdatingBenefits(true)
      setBenefitMessage({ type: '', text: '' })
      
      const result = await updateAllBenefitSettings(benefitForm)
      
      if (result.success) {
        onSettingsUpdate(benefitForm)
        setShowBenefitPopup(false)
        setBenefitMessage({ type: 'success', text: 'Benefit settings updated successfully' })
        setTimeout(() => setBenefitMessage({ type: '', text: '' }), 5000)
      } else {
        setBenefitMessage({ type: 'error', text: result.message })
        setTimeout(() => setBenefitMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error updating benefit settings:", error)
      setBenefitMessage({ type: 'error', text: 'Failed to update benefit settings' })
      setTimeout(() => setBenefitMessage({ type: '', text: '' }), 5000)
    } finally {
      setIsUpdatingBenefits(false)
    }
  }, [benefitForm, onSettingsUpdate])

  const handleBenefitCancel = useCallback(() => {
    setShowBenefitPopup(false)
    // Reset form to current settings
    const updatedForm = { ...benefitForm }
    Object.keys(benefitSettings).forEach(role => {
      const setting = benefitSettings[role]
      updatedForm[role] = {
        profileName: setting.profileName,
        basedOn: setting.basedOn,
        benefitType: setting.benefitType,
        value: setting.value,
        currency: setting.currency
      }
    })
    setBenefitForm(updatedForm)
  }, [benefitSettings, benefitForm])

  const handleBenefitFormChange = useCallback((role, field, value) => {
    setBenefitForm(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }))
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
          {/* Benefit Messages */}
          {benefitMessage.text && (
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: benefitMessage.type === 'success' ? '#4caf50' : '#f44336',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
              >
                {benefitMessage.text}
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
              Benefit Settings
            </Typography>
            <IconButton 
              size="small"
              onClick={handleBenefitEdit}
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

          {Object.keys(benefitSettings).length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 1.5 
            }}>
              {Object.entries(benefitSettings).map(([role, setting]) => (
                <Box key={role} sx={{ 
                  p: 1.5,
                  background: 'linear-gradient(135deg, #00588be0 0%, #00a8e8 100%)',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 0
                  },
                  '& > *': {
                    position: 'relative',
                    zIndex: 1
                  },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 168, 232, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#ffffff', 
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                    }}>
                      {setting.profileName}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#ffffff', 
                      fontWeight: 700, 
                      fontSize: '0.75rem',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      px: 1,
                      py: 0.5,
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      {setting.value}{setting.benefitType === 'percentage' ? '%' : ` ${setting.currency}`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '0.6rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    px: 1,
                    py: 0.5,
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    alignSelf: 'flex-start'
                  }}>
                    {setting.benefitType} {setting.basedOn}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                No benefit settings configured
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleBenefitEdit}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  fontSize: '0.7rem',
                  py: 0.5,
                  px: 2
                }}
              >
                Configure
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Benefit Settings Edit Popup */}
      {showBenefitPopup && (
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
          onClick={handleBenefitCancel}
        >
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              maxWidth: 800,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              p: 3
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Configure Benefit Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 3, textAlign: 'center' }}>
                Set benefit calculations for each role in the glass eel trading system
              </Typography>
              
              <Grid container spacing={3}>
                {Object.entries(benefitForm).map(([role, setting]) => (
                  <Grid item xs={12} sm={6} key={role}>
                    <Card sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      border: '1px solid rgba(0, 168, 232, 0.2)'
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 2 }}>
                        {setting.profileName}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                          Calculation Method
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={setting.basedOn}
                          onChange={(e) => handleBenefitFormChange(role, 'basedOn', e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
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
                          <option value="perKg">Per Kilogram</option>
                          <option value="total">Total Transaction</option>
                        </TextField>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                          Benefit Type
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={setting.benefitType}
                          onChange={(e) => handleBenefitFormChange(role, 'benefitType', e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
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
                          <option value="fixed">Fixed Amount</option>
                          <option value="percentage">Percentage</option>
                        </TextField>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                          Value
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={setting.value}
                          onChange={(e) => handleBenefitFormChange(role, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="Enter value"
                          size="small"
                          InputProps={{
                            endAdornment: setting.benefitType === 'percentage' ? 
                              <InputAdornment position="end">%</InputAdornment> :
                              <InputAdornment position="end">{setting.currency}</InputAdornment>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
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
                            step: setting.benefitType === 'percentage' ? 0.1 : 1
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4f4f4fb3', mb: 1 }}>
                          Currency
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={setting.currency}
                          onChange={(e) => handleBenefitFormChange(role, 'currency', e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
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
                          <option value="HTG">HTG</option>
                          <option value="USD">USD</option>
                        </TextField>
                      </Box>

                      {/* Preview */}
                      <Box sx={{ 
                        p: 1.5, 
                        backgroundColor: 'rgba(0, 168, 232, 0.1)', 
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 168, 232, 0.2)'
                      }}>
                        <Typography variant="caption" sx={{ color: '#4f4f4fb3', display: 'block', mb: 0.5 }}>
                          Preview:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
                          {setting.benefitType === 'percentage' ? 
                            `${setting.value}% of ${setting.basedOn === 'perKg' ? 'total kg value' : 'total transaction'}` :
                            `${setting.value} ${setting.currency} ${setting.basedOn === 'perKg' ? 'per kg' : 'per transaction'}`
                          }
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleBenefitCancel}
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
                onClick={handleBenefitSave}
                disabled={isUpdatingBenefits}
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
                {isUpdatingBenefits ? 'Updating...' : 'Update Settings'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </>
  )
}

export default BenefitSettings
