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
  MenuItem,
} from '@mui/material';
import {
  createTransfer,
  fetchTransfers,
  fetchTransferStats,
} from '../redux/slices/storesSlice';
import { fetchProducts } from '../redux/slices/productsSlice';

const TransferFormModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { stores, loading } = useSelector((state) => state.stores);
  const { products } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    from_store_id: '',
    to_store_id: '',
    product_id: '',
    quantity: 1,
    notes: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchProducts());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) {
      setFormData({
        from_store_id: '',
        to_store_id: '',
        product_id: '',
        quantity: 1,
        notes: '',
      });
      setFormError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.from_store_id) {
      setFormError('Please select source store');
      return false;
    }
    if (!formData.to_store_id) {
      setFormError('Please select destination store');
      return false;
    }
    if (formData.from_store_id === formData.to_store_id) {
      setFormError('Source and destination stores must be different');
      return false;
    }
    if (!formData.product_id) {
      setFormError('Please select a product');
      return false;
    }
    if (formData.quantity < 1) {
      setFormError('Quantity must be at least 1');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(createTransfer(formData)).unwrap();
      dispatch(fetchTransfers({}));
      dispatch(fetchTransferStats());
      onClose();
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    }
  };

  const activeStores = stores.filter((s) => s.is_active);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Transfer Request</DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="From Store"
                name="from_store_id"
                value={formData.from_store_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {activeStores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="To Store"
                name="to_store_id"
                value={formData.to_store_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {activeStores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Product"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.current_stock})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Optional notes about this transfer..."
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
          Create Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferFormModal;
