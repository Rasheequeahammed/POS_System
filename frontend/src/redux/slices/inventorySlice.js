import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async ({ skip = 0, limit = 100, category = null, search = null, lowStockOnly = false } = {}) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (lowStockOnly) params.append('low_stock_only', 'true');
    
    const response = await api.get(`/inventory?${params}`);
    return response.data;
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  'inventory/fetchLowStockAlerts',
  async () => {
    const response = await api.get('/inventory/low-stock-alerts');
    return response.data;
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchInventorySummary',
  async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ productId, adjustmentType, quantityChange, reason }) => {
    const params = new URLSearchParams();
    params.append('adjustment_type', adjustmentType);
    params.append('quantity_change', quantityChange);
    if (reason) params.append('reason', reason);
    
    const response = await api.post(`/inventory/adjust-stock/${productId}?${params}`);
    return response.data;
  }
);

export const updateReorderPoint = createAsyncThunk(
  'inventory/updateReorderPoint',
  async ({ productId, minimumStock }) => {
    const params = new URLSearchParams();
    params.append('minimum_stock', minimumStock);
    
    const response = await api.put(`/inventory/reorder-point/${productId}?${params}`);
    return response.data;
  }
);

export const fetchStockAdjustments = createAsyncThunk(
  'inventory/fetchStockAdjustments',
  async ({ skip = 0, limit = 50, productId = null, adjustmentType = null, startDate = null, endDate = null } = {}) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (productId) params.append('product_id', productId);
    if (adjustmentType) params.append('adjustment_type', adjustmentType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/inventory/adjustments?${params}`);
    return response.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async () => {
    const response = await api.get('/inventory/categories');
    return response.data.categories;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    total: 0,
    lowStockAlerts: {
      total_alerts: 0,
      critical_count: 0,
      warning_count: 0,
      alerts: [],
    },
    summary: {
      total_products: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      total_inventory_value: 0,
      total_units: 0,
      categories: [],
    },
    adjustments: [],
    adjustmentsTotal: 0,
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Low Stock Alerts
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockAlerts = action.payload;
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Inventory Summary
      .addCase(fetchInventorySummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Adjust Stock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(adjustStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update Reorder Point
      .addCase(updateReorderPoint.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReorderPoint.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateReorderPoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Stock Adjustments
      .addCase(fetchStockAdjustments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStockAdjustments.fulfilled, (state, action) => {
        state.loading = false;
        state.adjustments = action.payload.adjustments;
        state.adjustmentsTotal = action.payload.total;
      })
      .addCase(fetchStockAdjustments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
