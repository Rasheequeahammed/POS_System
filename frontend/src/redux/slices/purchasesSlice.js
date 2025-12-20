import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchases/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch purchases');
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  'purchases/fetchPurchaseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch purchase');
    }
  }
);

export const createPurchase = createAsyncThunk(
  'purchases/createPurchase',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchases/', purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create purchase');
    }
  }
);

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState: {
    items: [],
    selectedPurchase: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPurchase: (state) => {
      state.selectedPurchase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Purchase By ID
      .addCase(fetchPurchaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPurchase = action.payload;
      })
      .addCase(fetchPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedPurchase } = purchasesSlice.actions;
export default purchasesSlice.reducer;
