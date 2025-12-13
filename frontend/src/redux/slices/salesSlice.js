import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async ({ startDate, endDate, customer, paymentMethod } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (customer) params.append('customer', customer);
      if (paymentMethod) params.append('payment_method', paymentMethod);
      
      const response = await api.get(`/sales?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch sales');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch sale details');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales/', saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    items: [],
    currentSale: null,
    loading: false,
    error: null,
    stats: {
      totalRevenue: 0,
      totalSales: 0,
      averageSale: 0,
      itemsSold: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    calculateStats: (state) => {
      const sales = state.items;
      state.stats.totalSales = sales.length;
      state.stats.totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
      state.stats.averageSale = state.stats.totalSales > 0 
        ? state.stats.totalRevenue / state.stats.totalSales 
        : 0;
      state.stats.itemsSold = sales.reduce((sum, sale) => 
        sum + (sale.items?.reduce((s, item) => s + item.quantity, 0) || 0), 0
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        salesSlice.caseReducers.calculateStats(state);
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sale By ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        salesSlice.caseReducers.calculateStats(state);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentSale, calculateStats } = salesSlice.actions;
export default salesSlice.reducer;
