import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Done as CompleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  fetchTransfers,
  fetchTransferStats,
  approveTransfer,
  completeTransfer,
  rejectTransfer,
  clearError,
} from '../redux/slices/storesSlice';
import { fetchStores } from '../redux/slices/storesSlice';
import TransferFormModal from '../components/TransferFormModal';

const InventoryTransferPage = () => {
  const dispatch = useDispatch();
  const { transfers, transferStats, stores, loading, error } = useSelector((state) => state.stores);
  const currentUser = useSelector((state) => state.auth.user);

  const [openModal, setOpenModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromStore, setFilterFromStore] = useState('');
  const [filterToStore, setFilterToStore] = useState('');

  useEffect(() => {
    dispatch(fetchStores());
    loadTransfers();
    dispatch(fetchTransferStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const loadTransfers = () => {
    dispatch(fetchTransfers({
      status: filterStatus || null,
      fromStoreId: filterFromStore || null,
      toStoreId: filterToStore || null,
    }));
  };

  const handleApplyFilters = () => {
    loadTransfers();
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterFromStore('');
    setFilterToStore('');
    dispatch(fetchTransfers({}));
  };

  const handleApprove = async (transferId) => {
    await dispatch(approveTransfer(transferId));
    loadTransfers();
    dispatch(fetchTransferStats());
  };

  const handleComplete = async (transferId) => {
    await dispatch(completeTransfer(transferId));
    loadTransfers();
    dispatch(fetchTransferStats());
  };

  const handleReject = async (transferId) => {
    const notes = prompt('Enter rejection reason (optional):');
    await dispatch(rejectTransfer({ transferId, notes }));
    loadTransfers();
    dispatch(fetchTransferStats());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'IN_TRANSIT': return 'primary';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const canApprove = currentUser?.role?.toUpperCase() === 'ADMIN' || 
                     currentUser?.role?.toUpperCase() === 'MANAGER';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Inventory Transfers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          New Transfer Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {transferStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="overline">Total</Typography>
                <Typography variant="h5">{transferStats.total_transfers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent>
                <Typography color="warning.main" variant="overline">Pending</Typography>
                <Typography variant="h5" color="warning.main">{transferStats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent>
                <Typography color="info.main" variant="overline">Approved</Typography>
                <Typography variant="h5" color="info.main">{transferStats.approved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent>
                <Typography color="success.main" variant="overline">Completed</Typography>
                <Typography variant="h5" color="success.main">{transferStats.completed}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card>
              <CardContent>
                <Typography color="error.main" variant="overline">Rejected</Typography>
                <Typography variant="h5" color="error.main">{transferStats.rejected}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </TextField>
          <TextField
            select
            label="From Store"
            value={filterFromStore}
            onChange={(e) => setFilterFromStore(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Stores</MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>{store.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="To Store"
            value={filterToStore}
            onChange={(e) => setFilterToStore(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Stores</MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>{store.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleApplyFilters}>Apply</Button>
          <Button variant="outlined" onClick={handleClearFilters}>Clear</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadTransfers}>
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Transfers Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transfer #</TableCell>
                <TableCell>From Store</TableCell>
                <TableCell>To Store</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell><Chip label={transfer.transfer_number} size="small" /></TableCell>
                    <TableCell>{getStoreName(transfer.from_store_id)}</TableCell>
                    <TableCell>{getStoreName(transfer.to_store_id)}</TableCell>
                    <TableCell>Product #{transfer.product_id}</TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transfer.status} 
                        color={getStatusColor(transfer.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      {transfer.status === 'PENDING' && canApprove && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(transfer.id)}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(transfer.id)}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {transfer.status === 'APPROVED' && canApprove && (
                        <Tooltip title="Mark as Completed">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleComplete(transfer.id)}
                          >
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TransferFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Container>
  );
};

export default InventoryTransferPage;
