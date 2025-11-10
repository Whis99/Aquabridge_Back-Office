import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material"
import {
  AccountBalance as BankIcon,
  Assignment as DetailsIcon,
  CheckCircle as ApproveIcon,
  Close as CloseIcon,
  CreditScore as ProcessIcon,
  Refresh as RefreshIcon,
  WarningAmber as RejectIcon
} from "@mui/icons-material"

import {
  getCreditRequests,
  approveCreditRequest,
  rejectCreditRequest,
  processCreditRequest
} from "../services/firebaseServices"

// Mapping of status values to consistent chip styling
const STATUS_STYLES = {
  pending: { color: "#ff9800", label: "Pending" },
  approved: { color: "#4caf50", label: "Approved" },
  processing: { color: "#2196f3", label: "Processing" },
  processed: { color: "#2e7d32", label: "Processed" },
  rejected: { color: "#f44336", label: "Rejected" }
}

// Options displayed in the status filter dropdown
const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "processed", label: "Processed" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All Requests" }
]

// Convert Firestore timestamp / ISO string to JS Date
const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (value?.toDate) return value.toDate()
  return new Date(value)
}

// Format dates in a readable way for the admin
const formatDate = (value) => {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date)
}

// Format currency values with graceful fallback
const formatAmount = (amount, currency) => {
  if (typeof amount !== "number") {
    return "—"
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    return `${amount.toFixed(2)} ${currency || ""}`.trim()
  }
}

// Extract account details map into array for display
const normalizeAccountDetails = (details) => {
  if (!details || typeof details !== "object") {
    return []
  }

  return Object.entries(details).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " "),
    value
  }))
}

const CreditRequests = () => {
  // ==================== STATE ====================

  // Credit request listing
  const [creditRequests, setCreditRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState("pending")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Detail & action dialogs
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState({ open: false, type: null })
  const [actionForm, setActionForm] = useState({ notes: "", reason: "", transactionReference: "" })
  const [actionError, setActionError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState("")

  // ==================== MEMOIZED VALUES ====================

  // Selected request account details prepared for rendering
  const selectedAccountDetails = useMemo(() => normalizeAccountDetails(selectedRequest?.account_details), [selectedRequest])

  // Determine which action buttons should be visible
  const availableActions = useMemo(() => {
    if (!selectedRequest) {
      return { canApprove: false, canReject: false, canProcess: false }
    }

    return {
      canApprove: selectedRequest.status === "pending",
      canReject: selectedRequest.status === "pending" || selectedRequest.status === "approved",
      canProcess: selectedRequest.status === "approved"
    }
  }, [selectedRequest])

  // ==================== DATA FETCHING ====================

  const fetchCreditRequests = useCallback(async () => {
    let fetchedRequests = []
    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await getCreditRequests({
        status: statusFilter === "all" ? null : statusFilter,
        limit: 100
      })

      if (!response.success) {
        throw new Error(response.message || "Failed to load credit requests")
      }

      fetchedRequests = response.data || []
      setCreditRequests(fetchedRequests)
    } catch (error) {
      console.error("Error fetching credit requests:", error)
      setErrorMessage(error.message || "Failed to load credit requests")
      fetchedRequests = []
    } finally {
      setIsLoading(false)
    }
    return fetchedRequests
  }, [statusFilter])

  useEffect(() => {
    // Load credit requests whenever the filter changes
    fetchCreditRequests()
  }, [fetchCreditRequests])

  // ==================== EVENT HANDLERS ====================

  const handleOpenDetails = (request) => {
    setSelectedRequest(request)
    setIsDetailOpen(true)
    setActionSuccess("")
    setActionError("")
  }

  const handleCloseDetails = () => {
    setIsDetailOpen(false)
    setSelectedRequest(null)
    setActionSuccess("")
    setActionError("")
  }

  const handleOpenActionDialog = (type) => {
    setActionDialog({ open: true, type })
    setActionError("")
    setActionSuccess("")

    // Initialize form values based on action
    if (type === "reject") {
      setActionForm({ notes: "", reason: "", transactionReference: "" })
    } else if (type === "process") {
      setActionForm({
        notes: selectedRequest?.notes || "",
        transactionReference: "",
        reason: ""
      })
    } else {
      setActionForm({
        notes: selectedRequest?.notes || "",
        transactionReference: "",
        reason: ""
      })
    }
  }

  const handleCloseActionDialog = () => {
    setActionDialog({ open: false, type: null })
    setActionError("")
    setActionSuccess("")
  }

  const handleActionFormChange = (field, value) => {
    setActionForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Execute approve / reject / process flows with validation and error handling
  const handleSubmitAction = async () => {
    if (!selectedRequest) {
      setActionError("No credit request selected")
      return
    }

    try {
      setActionLoading(true)
      setActionError("")
      setActionSuccess("")

      let response

      if (actionDialog.type === "approve") {
        // No special validation for approving; notes are optional
        response = await approveCreditRequest(selectedRequest.id, undefined, actionForm.notes?.trim() || "")
      } else if (actionDialog.type === "reject") {
        // Ensure a reason is supplied before rejecting
        if (!actionForm.reason || actionForm.reason.trim().length < 5) {
          setActionError("Please provide a rejection reason (at least 5 characters).")
          setActionLoading(false)
          return
        }
        response = await rejectCreditRequest(selectedRequest.id, undefined, actionForm.reason.trim())
      } else if (actionDialog.type === "process") {
        // Confirm we have an approved credit request before processing
        if (selectedRequest.status !== "approved") {
          setActionError("Only approved credit requests can be processed.")
          setActionLoading(false)
          return
        }

        if (!selectedRequest.amount || selectedRequest.amount <= 0) {
          setActionError("Credit amount is invalid.")
          setActionLoading(false)
          return
        }

        if (!selectedRequest.user_id) {
          setActionError("Credit request is missing the target user id.")
          setActionLoading(false)
          return
        }

        response = await processCreditRequest(selectedRequest.id, undefined, {
          transactionReference: actionForm.transactionReference.trim(),
          notes: actionForm.notes?.trim()
        })
      } else {
        setActionError("Unsupported action")
        setActionLoading(false)
        return
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to perform action")
      }

      setActionSuccess(response.message || "Action completed successfully")
      await fetchCreditRequests()

      if (selectedRequest) {
        const updatedStatus =
          actionDialog.type === "process"
            ? "processed"
            : actionDialog.type === "approve"
              ? "approved"
              : actionDialog.type === "reject"
                ? "rejected"
                : selectedRequest.status

        setSelectedRequest((prev) =>
          prev
            ? {
                ...prev,
                status: updatedStatus,
                notes:
                  actionDialog.type === "reject"
                    ? prev.notes
                    : actionDialog.type === "approve" || actionDialog.type === "process"
                      ? actionForm.notes?.trim() || prev.notes
                      : prev.notes,
                rejection_reason:
                  actionDialog.type === "reject" ? actionForm.reason.trim() : prev.rejection_reason,
                processed_at:
                  actionDialog.type === "process" ? new Date() : prev.processed_at,
                processed_by:
                  actionDialog.type === "process" ? "ADM-202509-1344" : prev.processed_by,
                transaction_reference:
                  actionDialog.type === "process"
                    ? actionForm.transactionReference.trim() || prev.transaction_reference
                    : prev.transaction_reference,
                wallet_transaction_id:
                  response.walletTransactionId || prev.wallet_transaction_id,
                updated_at: new Date()
              }
            : prev
        )
      }

      handleCloseActionDialog()
    } catch (error) {
      console.error("Error performing credit request action:", error)
      setActionError(error.message || "Failed to perform action")
    } finally {
      setActionLoading(false)
    }
  }

  // ==================== RENDER HELPERS ====================

  const renderStatusChip = (status) => {
    const style = STATUS_STYLES[status] || { color: "#607d8b", label: status }
    return (
      <Chip
        label={style.label}
        size="small"
        sx={{
          fontWeight: 600,
          textTransform: "capitalize",
          backgroundColor: `${style.color}20`,
          color: style.color,
          borderRadius: "999px"
        }}
      />
    )
  }

  const renderProofLink = (proof) => {
    if (!proof || (!proof.file_path && !proof.file_url)) {
      return "N/A"
    }

    const href = proof.file_url || proof.file_path
    return (
      <Button
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        variant="outlined"
        sx={{ textTransform: "none" }}
      >
        View Proof
      </Button>
    )
  }

  // ==================== RENDER ====================

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Credit Requests
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Review, approve, and process credit top-ups requested by field entities.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_FILTERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCreditRequests}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ color: "#666" }}>
                Loading credit requests...
              </Typography>
            </Box>
          ) : creditRequests.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No credit requests found
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Adjust the filter above or check back later.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="center">Method</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditRequests.map((request) => (
                    <TableRow hover key={request.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {request.credit_request_id || request.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {request.currency || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {request.user_id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666", textTransform: "capitalize" }}>
                          {request.user_type || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {formatAmount(request.amount, request.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={request.method || "—"} size="small" sx={{ textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell align="center">{renderStatusChip(request.status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(request.submitted_at)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DetailsIcon fontSize="small" />}
                            onClick={() => handleOpenDetails(request)}
                          >
                            Details
                          </Button>
                          {request.status === "pending" && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedRequest(request)
                                handleOpenActionDialog("approve")
                              }}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          )}
                          {(request.status === "pending" || request.status === "approved") && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedRequest(request)
                                handleOpenActionDialog("reject")
                              }}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          )}
                          {request.status === "approved" && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedRequest(request)
                                handleOpenActionDialog("process")
                              }}
                            >
                              <ProcessIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog shows the full request payload */}
      <Dialog
        open={isDetailOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Credit Request Details
          </Typography>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                  Request Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Request ID
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedRequest.credit_request_id || selectedRequest.id}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Status
                      </Typography>
                      {renderStatusChip(selectedRequest.status)}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Amount
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {formatAmount(selectedRequest.amount, selectedRequest.currency)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Requested By
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedRequest.user_id}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666", textTransform: "capitalize" }}>
                        {selectedRequest.user_type || "—"}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BankIcon sx={{ color: "#00a8e8" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Aquabridge Bank Details
                  </Typography>
                </Stack>
                {selectedAccountDetails.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    No bank details provided.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {selectedAccountDetails.map((detail) => (
                      <Grid item xs={12} sm={6} key={detail.key}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                          <Typography variant="caption" sx={{ color: "#666", textTransform: "capitalize" }}>
                            {detail.label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {detail.value || "—"}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Proof Of Payment
                </Typography>
                {renderProofLink(selectedRequest.proof_of_payment)}
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Submitted At
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedRequest.submitted_at)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Updated At
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedRequest.updated_at)}</Typography>
                  </Paper>
                </Grid>
                {selectedRequest.transaction_reference && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Transaction Reference
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedRequest.transaction_reference}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {selectedRequest.notes && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        Notes
                      </Typography>
                      <Typography variant="body1">{selectedRequest.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Stack>
          ) : (
            <Typography variant="body1">Credit request not found.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Box>
            {actionSuccess && (
              <Alert severity="success" sx={{ mr: 2 }}>
                {actionSuccess}
              </Alert>
            )}
            {actionError && (
              <Alert severity="error" sx={{ mr: 2 }}>
                {actionError}
              </Alert>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleCloseDetails}>Close</Button>
            {availableActions.canApprove && (
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleOpenActionDialog("approve")}
              >
                Approve
              </Button>
            )}
            {availableActions.canReject && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleOpenActionDialog("reject")}
              >
                Reject
              </Button>
            )}
            {availableActions.canProcess && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ProcessIcon />}
                onClick={() => handleOpenActionDialog("process")}
              >
                Process Credit
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Action dialog provides approvals, rejections, or processing forms */}
      <Dialog
        open={actionDialog.open}
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
            {actionDialog.type} credit request
          </Typography>
          <IconButton onClick={handleCloseActionDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {actionDialog.type === "approve" && (
            <Stack spacing={3}>
              <Alert severity="info">
                Approving confirms that the provided proof has been reviewed. You can add an optional note below.
              </Alert>
              <TextField
                label="Internal Notes (optional)"
                multiline
                minRows={3}
                value={actionForm.notes}
                onChange={(event) => handleActionFormChange("notes", event.target.value)}
                placeholder="Add any context that helps other admins understand this approval."
              />
            </Stack>
          )}

          {actionDialog.type === "reject" && (
            <Stack spacing={3}>
              <Alert severity="warning">
                Rejection notifies the requester that this credit will not be granted. Please provide a clear reason.
              </Alert>
              <TextField
                label="Rejection Reason"
                multiline
                minRows={3}
                value={actionForm.reason}
                onChange={(event) => handleActionFormChange("reason", event.target.value)}
                placeholder="Explain why the request is rejected. e.g. Proof is missing, mismatch with bank statement, etc."
                required
              />
            </Stack>
          )}

          {actionDialog.type === "process" && (
            <Stack spacing={3}>
              <Alert severity="info">
                Processing will credit the associated wallet immediately. Double-check the amount and destination before confirming.
              </Alert>
              <TextField
                label="Transaction Reference (optional)"
                value={actionForm.transactionReference}
                onChange={(event) => handleActionFormChange("transactionReference", event.target.value)}
                placeholder="Enter the bank transfer or internal reference number."
              />
              <TextField
                label="Notes (optional)"
                multiline
                minRows={3}
                value={actionForm.notes}
                onChange={(event) => handleActionFormChange("notes", event.target.value)}
                placeholder="Add context for bookkeeping (e.g. 'Funds settled on 2025-10-22')."
              />
            </Stack>
          )}

          {actionError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitAction}
            disabled={actionLoading}
            startIcon={
              actionDialog.type === "approve"
                ? <ApproveIcon />
                : actionDialog.type === "reject"
                  ? <RejectIcon />
                  : <ProcessIcon />
            }
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CreditRequests

