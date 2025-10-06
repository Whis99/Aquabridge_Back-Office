import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  ShoppingCart as ClientIcon,
  MoreVert as MoreIcon,
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material"
import { getAllPendingUsers, getAllActiveUsers, getAllUsers, getUsersByRole, getUserDetails, updateUserStatus, getUserById, getAllAdmins, createAdmin, updateAdminStatus, deleteAdmin, updateAdminDetails } from "../services/firebaseServices"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

const Users = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State
  const [pendingUsers, setPendingUsers] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [filteredActiveUsers, setFilteredActiveUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [userDetails, setUserDetails] = useState({})
  const [activeUserDetailsOpen, setActiveUserDetailsOpen] = useState(false)
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  
  // Admin management state
  const [admins, setAdmins] = useState([])
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    default_password: 'admin123'
  })
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [adminActionMenuAnchor, setAdminActionMenuAnchor] = useState(null)
  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Role options
  const roleOptions = [
    { value: "all", label: "All Roles", icon: PersonIcon },
    { value: "fisherman", label: "Fishermen", icon: PersonIcon },
    { value: "association", label: "Associations", icon: BusinessIcon },
    { value: "collection_center", label: "Collection Centers", icon: StoreIcon },
    { value: "client", label: "Clients", icon: ClientIcon }
  ]

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status", color: "#666" },
    { value: "active", label: "Active", color: "#4caf50" },
    { value: "frozen", label: "Frozen", color: "#ff9800" },
    { value: "inactive", label: "Inactive", color: "#9e9e9e" },
    { value: "suspended", label: "Suspended", color: "#f44336" }
  ]

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch pending users
        const pendingData = await getAllPendingUsers()
        const pendingUsersList = pendingData.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPendingUsers(pendingUsersList)

        // Fetch all users (not just active ones)
        const allUsersData = await getAllUsers()
        const allUsersList = allUsersData.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setActiveUsers(allUsersList)
        setFilteredActiveUsers(allUsersList)

        // Fetch admins
        const adminsData = await getAllAdmins()
        const adminsList = adminsData.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAdmins(adminsList)

      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter users
  useEffect(() => {
    let filtered = activeUsers

    // Exclude supervisors from the list
    filtered = filtered.filter(user => user.role !== "supervisor")

    // Exclude admin users (they have their own section)
    filtered = filtered.filter(user => user.role !== "admin")

    // Exclude pending users (they have their own section)
    filtered = filtered.filter(user => user.account_status !== "pending")

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        const userStatus = user.account_status || "active"
        return userStatus === statusFilter
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredActiveUsers(filtered)
  }, [activeUsers, roleFilter, statusFilter, searchTerm])

  // Handle user approval
  const handleApproveUser = async (userId) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        account_status: "active"
      })
      
      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      setActiveUsers(prev => [...prev, selectedUser])
      setApproveDialogOpen(false)
      setSelectedUser(null)
      
    } catch (error) {
      console.error("Error approving user:", error)
    }
  }

  // Handle active user details
  const handleViewUserDetails = async (user) => {
    try {
      setSelectedUser(user)
      setActiveUserDetailsOpen(true)
      
      // Fetch additional details based on role
      const additionalDetails = await getUserDetails(
        user.role === 'fisherman' ? 'fishermen' : 
        user.role === 'association' ? 'associations' : 
        user.role === 'collection_center' ? 'collection_centers' : 'client',
        user.user_id
      )
      
      if (!additionalDetails.empty) {
        setUserDetails(additionalDetails.docs[0].data())
      } else {
        setUserDetails({})
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      setUserDetails({})
    }
  }

  // Handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus)
      
      // Update local state
      setActiveUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, account_status: newStatus }
            : user
        )
      )
      
      setStatusMenuAnchor(null)
      setSelectedUserId(null)
      
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  // Handle status menu
  const handleStatusMenuOpen = (event, userId) => {
    event.stopPropagation()
    setStatusMenuAnchor(event.currentTarget)
    setSelectedUserId(userId)
  }

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null)
    setSelectedUserId(null)
  }

  // Get user details from specific collection
  const fetchUserDetails = async (user) => {
    try {
      const collectionName = user.role === "fisherman" ? "fishermen" : 
                           user.role === "association" ? "associations" :
                           user.role === "collection_center" ? "collection_centers" : "client"
      
      const detailsData = await getUserDetails(collectionName, user.user_id)
      if (!detailsData.empty) {
        setUserDetails(detailsData.docs[0].data())
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
    }
  }

  // Handle user selection for approval
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    fetchUserDetails(user)
    setApproveDialogOpen(true)
  }

  // ==================== ADMIN MANAGEMENT FUNCTIONS ====================

  // Handle admin form input changes
  const handleAdminFormChange = (field, value) => {
    setAdminFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle create/edit admin
  const handleAdminSubmit = async () => {
    try {
      if (editingAdmin) {
        // Update existing admin
        const result = await updateAdminDetails(editingAdmin.admin_id, adminFormData)
        if (result.success) {
          // Update local state
          setAdmins(prev => 
            prev.map(admin => 
              admin.admin_id === editingAdmin.admin_id 
                ? { ...admin, ...adminFormData }
                : admin
            )
          )
          setAdminDialogOpen(false)
          setEditingAdmin(null)
          setAdminFormData({
            name: '',
            email: '',
            default_password: 'admin123'
          })
          setAdminMessage({ type: 'success', text: 'Admin updated successfully!' })
          setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
        } else {
          setAdminMessage({ type: 'error', text: result.message })
          setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
        }
      } else {
        // Create new admin
        const result = await createAdmin(adminFormData)
        if (result.success) {
          // Refresh admins list
          const adminsData = await getAllAdmins()
          const adminsList = adminsData.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setAdmins(adminsList)
          setAdminDialogOpen(false)
          setAdminFormData({
            name: '',
            email: '',
            default_password: 'admin123'
          })
          setAdminMessage({ type: 'success', text: 'Admin created successfully!' })
          setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
        } else {
          setAdminMessage({ type: 'error', text: result.message })
          setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
        }
      }
    } catch (error) {
      console.error("Error handling admin:", error)
      setAdminMessage({ type: 'error', text: 'An unexpected error occurred' })
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
    }
  }

  // Handle admin action menu
  const handleAdminActionMenuOpen = (event, adminId) => {
    event.stopPropagation()
    setAdminActionMenuAnchor(event.currentTarget)
    setSelectedAdminId(adminId)
  }

  const handleAdminActionMenuClose = () => {
    setAdminActionMenuAnchor(null)
    setSelectedAdminId(null)
  }

  // Handle admin status change
  const handleAdminStatusChange = async (adminId, newStatus) => {
    try {
      const result = await updateAdminStatus(adminId, newStatus)
      if (result.success) {
        // Update local state
        setAdmins(prev => 
          prev.map(admin => 
            admin.admin_id === adminId 
              ? { ...admin, account_status: newStatus }
              : admin
          )
        )
        setAdminActionMenuAnchor(null)
        setSelectedAdminId(null)
        setAdminMessage({ type: 'success', text: `Admin status updated to ${newStatus}` })
        setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
      } else {
        setAdminMessage({ type: 'error', text: result.message })
        setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error updating admin status:", error)
      setAdminMessage({ type: 'error', text: 'Failed to update admin status' })
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
    }
  }

  // Handle admin deletion
  const handleAdminDelete = async (adminId) => {
    try {
      const result = await deleteAdmin(adminId)
      if (result.success) {
        // Update local state
        setAdmins(prev => prev.filter(admin => admin.admin_id !== adminId))
        setAdminActionMenuAnchor(null)
        setSelectedAdminId(null)
        setAdminMessage({ type: 'success', text: 'Admin deleted successfully' })
        setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
      } else {
        setAdminMessage({ type: 'error', text: result.message })
        setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error("Error deleting admin:", error)
      setAdminMessage({ type: 'error', text: 'Failed to delete admin' })
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000)
    }
  }

  // Handle admin edit
  const handleAdminEdit = (admin) => {
    setEditingAdmin(admin)
    setAdminFormData({
      name: admin.name,
      email: admin.email,
      default_password: admin.default_password || 'admin123'
    })
    setShowPassword(false)
    setAdminDialogOpen(true)
    setAdminActionMenuAnchor(null)
    setSelectedAdminId(null)
  }

  // Handle new admin creation
  const handleNewAdmin = () => {
    setEditingAdmin(null)
    setAdminFormData({
      name: '',
      email: '',
      default_password: 'admin123'
    })
    setShowPassword(false)
    setAdminDialogOpen(true)
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    try {
      // Handle Firebase Timestamp object
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle regular Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle Unix timestamp (seconds)
      if (typeof timestamp === 'number') {
        const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Handle string timestamp
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return "Invalid Date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Format value for display in additional details
  const formatValue = (key, value) => {
    // Check if this looks like a timestamp field
    const isTimestampField = key.toLowerCase().includes('date') || 
                            key.toLowerCase().includes('time') || 
                            key.toLowerCase().includes('at') ||
                            key.toLowerCase().includes('created') ||
                            key.toLowerCase().includes('updated')
    
    if (isTimestampField && value) {
      // Try to format as date
      const formattedDate = formatDate(value)
      if (formattedDate !== "Invalid Date" && formattedDate !== "N/A") {
        return formattedDate
      }
    }
    
    // For objects, stringify with proper formatting
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    
    // For other values, convert to string
    return String(value)
  }

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      fisherman: "#4caf50",
      association: "#2196f3", 
      collection_center: "#ff9800",
      client: "#9c27b0"
    }
    return colors[role] || "#757575"
  }

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      fisherman: PersonIcon,
      association: BusinessIcon,
      collection_center: StoreIcon,
      client: ClientIcon
    }
    return icons[role] || PersonIcon
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#0e0e0eff', fontWeight: 700 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AdminIcon />}
          onClick={handleNewAdmin}
          sx={{
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            }
          }}
        >
          Manage Admins
        </Button>
      </Box>

      {/* Pending Users Section */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3 }}>
            Pending Users ({pendingUsers.length})
          </Typography>
          
          {pendingUsers.length === 0 ? (
            <Alert severity="info">No pending users to review.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <TableRow key={user.id}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{user.user_id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<RoleIcon sx={{ fontSize: 16 }} />}
                            label={user.role}
                            size="small"
                            sx={{
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role),
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleUserSelect(user)}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                              }
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Admin Management Section */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600, mb: 3 }}>
            Admin Management ({admins.length})
          </Typography>
          
          {/* Admin Messages */}
          {adminMessage.text && (
            <Alert 
              severity={adminMessage.type === 'success' ? 'success' : 'error'} 
              sx={{ mb: 3 }}
              onClose={() => setAdminMessage({ type: '', text: '' })}
            >
              {adminMessage.text}
            </Alert>
          )}
          
          {admins.length === 0 ? (
            <Alert severity="info">No admins found. Click "Manage Admins" to create one.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Admin ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{admin.admin_id}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.account_status || "Active"}
                          size="small"
                          sx={{
                            backgroundColor: admin.account_status === 'active' 
                              ? 'rgba(76, 175, 80, 0.1)' 
                              : admin.account_status === 'frozen'
                              ? 'rgba(255, 152, 0, 0.1)'
                              : admin.account_status === 'inactive'
                              ? 'rgba(158, 158, 158, 0.1)'
                              : 'rgba(244, 67, 54, 0.1)',
                            color: admin.account_status === 'active' 
                              ? '#4caf50' 
                              : admin.account_status === 'frozen'
                              ? '#ff9800'
                              : admin.account_status === 'inactive'
                              ? '#9e9e9e'
                              : '#f44336',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(admin.created_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleAdminEdit(admin)}
                            sx={{
                              borderColor: 'rgba(156, 39, 176, 0.3)',
                              color: '#9c27b0',
                              '&:hover': {
                                borderColor: '#9c27b0',
                                background: 'rgba(156, 39, 176, 0.1)'
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => handleAdminActionMenuOpen(e, admin.admin_id)}
                            sx={{
                              color: '#666',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Users Management Section */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#0e0e0eff', fontWeight: 600 }}>
              Users Management ({filteredActiveUsers.length})
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#4f4f4fb3' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  '&:hover': {
                    borderColor: '#00a8e8',
                    background: 'rgba(0, 168, 232, 0.1)'
                  }
                }}
              >
                Filter by Role
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setStatusFilterAnchor(e.currentTarget)}
                sx={{
                  borderColor: 'rgba(0, 168, 232, 0.3)',
                  color: '#00a8e8',
                  '&:hover': {
                    borderColor: '#00a8e8',
                    background: 'rgba(0, 168, 232, 0.1)'
                  }
                }}
              >
                Filter by Status
              </Button>
            </Box>
          </Box>

          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            {roleOptions.map((option) => {
              const Icon = option.icon
              return (
                <MenuItem
                  key={option.value}
                  onClick={() => {
                    setRoleFilter(option.value)
                    setFilterAnchor(null)
                  }}
                  selected={roleFilter === option.value}
                >
                  <Icon sx={{ mr: 1, fontSize: 20 }} />
                  {option.label}
                </MenuItem>
              )
            })}
          </Menu>

          <Menu
            anchorEl={statusFilterAnchor}
            open={Boolean(statusFilterAnchor)}
            onClose={() => setStatusFilterAnchor(null)}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value)
                  setStatusFilterAnchor(null)
                }}
                selected={statusFilter === option.value}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: option.color 
                    }} 
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {filteredActiveUsers.length === 0 ? (
            <Alert severity="info">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "No users found matching your criteria." 
                : "No users found."
              }
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActiveUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
    return (
                      <TableRow 
                        key={user.id}
                        hover
                        onClick={() => handleViewUserDetails(user)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace' }}>{user.user_id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={React.createElement(RoleIcon, { sx: { fontSize: 16 } })}
                            label={user.role}
                            size="small"
                            sx={{
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role),
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.account_status || "Active"}
                            size="small"
                            sx={{
                              backgroundColor: user.account_status === 'active' 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : user.account_status === 'frozen'
                                ? 'rgba(255, 152, 0, 0.1)'
                                : user.account_status === 'inactive'
                                ? 'rgba(158, 158, 158, 0.1)'
                                : 'rgba(244, 67, 54, 0.1)',
                              color: user.account_status === 'active' 
                                ? '#4caf50' 
                                : user.account_status === 'frozen'
                                ? '#ff9800'
                                : user.account_status === 'inactive'
                                ? '#9e9e9e'
                                : '#f44336',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewUserDetails(user)
                              }}
                              sx={{
                                borderColor: 'rgba(0, 168, 232, 0.3)',
                                color: '#00a8e8',
                                '&:hover': {
                                  borderColor: '#00a8e8',
                                  background: 'rgba(0, 168, 232, 0.1)'
                                }
                              }}
                            >
                              View Details
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => handleStatusMenuOpen(e, user.id)}
                              sx={{
                                color: '#666',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <MoreIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* User Approval Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {selectedUser?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Review User: {selectedUser?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Approval - Review Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Box>
              {/* Basic Information Section */}
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ 
                  color: '#ff9800', 
                  fontWeight: 600, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    backgroundColor: '#ff9800',
                    borderRadius: 1
                  }} />
                  Basic Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#ff9800'
                      }}>
                        {selectedUser.user_id}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Role
                      </Typography>
                      <Chip
                        icon={React.createElement(getRoleIcon(selectedUser.role), { sx: { fontSize: 16 } })}
                        label={selectedUser.role}
                        size="small"
                        sx={{
                          backgroundColor: `${getRoleColor(selectedUser.role)}20`,
                          color: getRoleColor(selectedUser.role),
                          fontWeight: 600,
                          border: `1px solid ${getRoleColor(selectedUser.role)}40`
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Account Status
                      </Typography>
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          color: '#ff9800',
                          fontWeight: 600,
                          border: '1px solid rgba(255, 152, 0, 0.3)'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Created At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedUser.created_at)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Details Section */}
              {Object.keys(userDetails).length > 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ff9800', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      backgroundColor: '#ff9800',
                      borderRadius: 1
                    }} />
                    Additional Information
                  </Typography>
                  
                  <Box
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      p: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 152, 0, 0.3)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: 'rgba(255, 152, 0, 0.5)',
                        },
                      },
                    }}
                  >
                    <Grid container spacing={2}>
                      {Object.entries(userDetails).map(([key, value]) => (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            height: '100%'
                          }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              mb: 1
                            }}>
                              {key.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              wordBreak: 'break-word',
                              lineHeight: 1.4
                            }}>
                              {formatValue(key, value)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Button 
            onClick={() => setApproveDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'rgba(158, 158, 158, 0.3)',
              color: '#666',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#666',
                background: 'rgba(158, 158, 158, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleApproveUser(selectedUser?.id)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              px: 3,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              }
            }}
          >
            Approve User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange(selectedUserId, 'frozen')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff9800' }} />
            Freeze Account
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedUserId, 'inactive')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9e9e9e' }} />
            Set Inactive
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedUserId, 'suspended')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
            Suspend Account
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedUserId, 'active')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50' }} />
            Reactivate Account
          </Box>
        </MenuItem>
      </Menu>

      {/* Active User Details Dialog */}
      <Dialog
        open={activeUserDetailsOpen}
        onClose={() => setActiveUserDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #00a8e8 0%, #0077b6 100%)',
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {selectedUser?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {selectedUser?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                User Details & Information
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Box>
              {/* Basic Information Section */}
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" sx={{ 
                  color: '#00a8e8', 
                  fontWeight: 600, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    backgroundColor: '#00a8e8',
                    borderRadius: 1
                  }} />
                  Basic Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#00a8e8'
                      }}>
                        {selectedUser.user_id}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Role
                      </Typography>
                      <Chip
                        icon={React.createElement(getRoleIcon(selectedUser.role), { sx: { fontSize: 16 } })}
                        label={selectedUser.role}
                        size="small"
                        sx={{
                          backgroundColor: `${getRoleColor(selectedUser.role)}20`,
                          color: getRoleColor(selectedUser.role),
                          fontWeight: 600,
                          border: `1px solid ${getRoleColor(selectedUser.role)}40`
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Account Status
                      </Typography>
                      <Chip
                        label={selectedUser.account_status || "Active"}
                        size="small"
                        sx={{
                          backgroundColor: selectedUser.account_status === 'active' 
                            ? 'rgba(76, 175, 80, 0.1)' 
                            : selectedUser.account_status === 'frozen'
                            ? 'rgba(255, 152, 0, 0.1)'
                            : selectedUser.account_status === 'inactive'
                            ? 'rgba(158, 158, 158, 0.1)'
                            : 'rgba(244, 67, 54, 0.1)',
                          color: selectedUser.account_status === 'active' 
                            ? '#4caf50' 
                            : selectedUser.account_status === 'frozen'
                            ? '#ff9800'
                            : selectedUser.account_status === 'inactive'
                            ? '#9e9e9e'
                            : '#f44336',
                          fontWeight: 600,
                          border: selectedUser.account_status === 'active' 
                            ? '1px solid rgba(76, 175, 80, 0.3)' 
                            : selectedUser.account_status === 'frozen'
                            ? '1px solid rgba(255, 152, 0, 0.3)'
                            : selectedUser.account_status === 'inactive'
                            ? '1px solid rgba(158, 158, 158, 0.3)'
                            : '1px solid rgba(244, 67, 54, 0.3)'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 168, 232, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 168, 232, 0.1)'
                    }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Created At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedUser.created_at)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Details Section */}
              {Object.keys(userDetails).length > 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#00a8e8', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      backgroundColor: '#00a8e8',
                      borderRadius: 1
                    }} />
                    Additional Information
                  </Typography>
                  
                  <Box
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      p: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0, 168, 232, 0.3)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: 'rgba(0, 168, 232, 0.5)',
                        },
                      },
                    }}
                  >
                    <Grid container spacing={2}>
                      {Object.entries(userDetails).map(([key, value]) => (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            height: '100%'
                          }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              mb: 1
                            }}>
                              {key.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              wordBreak: 'break-word',
                              lineHeight: 1.4
                            }}>
                              {formatValue(key, value)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Button 
            onClick={() => setActiveUserDetailsOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0, 168, 232, 0.3)',
              color: '#00a8e8',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#00a8e8',
                background: 'rgba(0, 168, 232, 0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Management Dialog */}
      <Dialog
        open={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
          color: 'white',
          py: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {editingAdmin ? 'Update admin information' : 'Add a new administrator to the system'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Name"
                value={adminFormData.name}
                onChange={(e) => handleAdminFormChange('name', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={adminFormData.email}
                onChange={(e) => handleAdminFormChange('email', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Password"
                type={showPassword ? "text" : "password"}
                value={adminFormData.default_password}
                onChange={(e) => handleAdminFormChange('default_password', e.target.value)}
                required
                helperText="This will be the initial password for the admin"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#9c27b0' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Button 
            onClick={() => {
              setAdminDialogOpen(false)
              setShowPassword(false)
            }}
            variant="outlined"
            sx={{
              borderColor: 'rgba(158, 158, 158, 0.3)',
              color: '#666',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#666',
                background: 'rgba(158, 158, 158, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdminSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              px: 3,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              }
            }}
          >
            {editingAdmin ? 'Update Admin' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Action Menu */}
      <Menu
        anchorEl={adminActionMenuAnchor}
        open={Boolean(adminActionMenuAnchor)}
        onClose={handleAdminActionMenuClose}
      >
        <MenuItem onClick={() => handleAdminStatusChange(selectedAdminId, 'frozen')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff9800' }} />
            Freeze Account
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleAdminStatusChange(selectedAdminId, 'inactive')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9e9e9e' }} />
            Set Inactive
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleAdminStatusChange(selectedAdminId, 'suspended')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
            Suspend Account
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleAdminStatusChange(selectedAdminId, 'active')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50' }} />
            Reactivate Account
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const admin = admins.find(a => a.admin_id === selectedAdminId)
            if (admin) handleAdminEdit(admin)
          }}
          sx={{ color: '#9c27b0' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ fontSize: 16 }} />
            Edit Details
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => handleAdminDelete(selectedAdminId)}
          sx={{ color: '#f44336' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ fontSize: 16 }} />
            Delete Admin
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Users