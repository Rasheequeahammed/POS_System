import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async ({ startDate = null, endDate = null, groupBy = 'day' } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('group_by', groupBy);
    
    const response = await api.get(`/reports/sales-report?${params}`);
    return response.data;
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'reports/fetchInventoryReport',
  async ({ category = null, lowStockOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (lowStockOnly) params.append('low_stock_only', 'true');
    
    const response = await api.get(`/reports/inventory-report?${params}`);
    return response.data;
  }
);

export const fetchPurchaseReport = createAsyncThunk(
  'reports/fetchPurchaseReport',
  async ({ startDate = null, endDate = null, supplierId = null } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (supplierId) params.append('supplier_id', supplierId);
    
    const response = await api.get(`/reports/purchase-report?${params}`);
    return response.data;
  }
);

export const fetchTaxReport = createAsyncThunk(
  'reports/fetchTaxReport',
  async ({ startDate = null, endDate = null } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/reports/tax-report?${params}`);
    return response.data;
  }
);

export const exportSalesCSV = createAsyncThunk(
  'reports/exportSalesCSV',
  async ({ startDate = null, endDate = null } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/reports/export/sales-csv?${params}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }
);

export const exportInventoryCSV = createAsyncThunk(
  'reports/exportInventoryCSV',
  async () => {
    const response = await api.get('/reports/export/inventory-csv', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    salesReport: null,
    inventoryReport: null,
    purchaseReport: null,
    taxReport: null,
    loading: false,
    error: null,
    exportLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sales Report
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Inventory Report
      .addCase(fetchInventoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryReport = action.payload;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Purchase Report
      .addCase(fetchPurchaseReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseReport.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseReport = action.payload;
      })
      .addCase(fetchPurchaseReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Tax Report
      .addCase(fetchTaxReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxReport.fulfilled, (state, action) => {
        state.loading = false;
        state.taxReport = action.payload;
      })
      .addCase(fetchTaxReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Export CSV
      .addCase(exportSalesCSV.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportSalesCSV.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportSalesCSV.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.error.message;
      })
      .addCase(exportInventoryCSV.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportInventoryCSV.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportInventoryCSV.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
