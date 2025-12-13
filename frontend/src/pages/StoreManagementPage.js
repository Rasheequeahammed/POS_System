import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  SwapHoriz as TransferIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import {
  fetchStores,
  fetchStoreStats,
  deleteStore,
  clearError,
} from '../redux/slices/storesSlice';
import StoreFormModal from '../components/StoreFormModal';

const StoreManagementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stores, stats, loading, error } = useSelector((state) => state.stores);
  const currentUser = useSelector((state) => state.auth.user);

  const [openModal, setOpenModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchStoreStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleAddStore = () => {
    setEditingStore(null);
    setOpenModal(true);
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setOpenModal(true);
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to deactivate this store?')) {
      await dispatch(deleteStore(storeId));
      dispatch(fetchStores());
      dispatch(fetchStoreStats());
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingStore(null);
  };

  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Store Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<TransferIcon />}
            onClick={() => navigate('/inventory-transfers')}
          >
            Inventory Transfers
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStore}
            disabled={!isAdmin}
          >
            Add Store
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      Total Stores
                    </Typography>
                    <Typography variant="h4">{stats.total_stores}</Typography>
                  </Box>
                  <StoreIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      Active Stores
                    </Typography>
                    <Typography variant="h4" color="success.main">{stats.active_stores}</Typography>
                  </Box>
                  <StatsIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      Inactive Stores
                    </Typography>
                    <Typography variant="h4" color="error.main">{stats.inactive_stores}</Typography>
                  </Box>
                  <StoreIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Stores Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No stores found. Add your first store to get started!
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <Chip label={store.code} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <strong>{store.name}</strong>
                    </TableCell>
                    <TableCell>{store.city || '-'}</TableCell>
                    <TableCell>{store.country || '-'}</TableCell>
                    <TableCell>{store.phone || '-'}</TableCell>
                    <TableCell>{store.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={store.is_active ? 'Active' : 'Inactive'}
                        color={store.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Store">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleEditStore(store)}
                            disabled={!isAdmin && currentUser?.role?.toUpperCase() !== 'MANAGER'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Deactivate Store">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteStore(store.id)}
                            disabled={!isAdmin || !store.is_active}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <StoreFormModal
        open={openModal}
        onClose={handleCloseModal}
        store={editingStore}
      />
    </Container>
  );
};

export default StoreManagementPage;
