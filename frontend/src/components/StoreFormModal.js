import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  createStore,
  updateStore,
  fetchStores,
  fetchStoreStats,
} from '../redux/slices/storesSlice';

const StoreFormModal = ({ open, onClose, store }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.stores);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        code: store.code,
        address: store.address || '',
        city: store.city || '',
        country: store.country || '',
        phone: store.phone || '',
        email: store.email || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
      });
    }
    setFormError('');
  }, [store, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Store name is required');
      return false;
    }
    if (!formData.code.trim()) {
      setFormError('Store code is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (store) {
        await dispatch(updateStore({ storeId: store.id, storeData: formData })).unwrap();
      } else {
        await dispatch(createStore(formData)).unwrap();
      }
      
      dispatch(fetchStores());
      dispatch(fetchStoreStats());
      onClose();
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{store ? 'Edit Store' : 'Add New Store'}</DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Store Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Store Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
                disabled={!!store}
                helperText="Unique identifier (cannot be changed)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {store ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreFormModal;
