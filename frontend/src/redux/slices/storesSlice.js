import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for stores
export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async ({ skip = 0, limit = 100, isActive = null } = {}) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (isActive !== null) params.append('is_active', isActive);
    
    const response = await api.get(`/stores?${params}`);
    return response.data;
  }
);

export const createStore = createAsyncThunk(
  'stores/createStore',
  async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data;
  }
);

export const updateStore = createAsyncThunk(
  'stores/updateStore',
  async ({ storeId, storeData }) => {
    const response = await api.put(`/stores/${storeId}`, storeData);
    return response.data;
  }
);

export const deleteStore = createAsyncThunk(
  'stores/deleteStore',
  async (storeId) => {
    await api.delete(`/stores/${storeId}`);
    return storeId;
  }
);

export const fetchStoreStats = createAsyncThunk(
  'stores/fetchStoreStats',
  async () => {
    const response = await api.get('/stores/stats/summary');
    return response.data;
  }
);

// Async thunks for transfers
export const fetchTransfers = createAsyncThunk(
  'stores/fetchTransfers',
  async ({ skip = 0, limit = 100, status = null, fromStoreId = null, toStoreId = null } = {}) => {
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (fromStoreId) params.append('from_store_id', fromStoreId);
    if (toStoreId) params.append('to_store_id', toStoreId);
    
    const response = await api.get(`/transfers?${params}`);
    return response.data;
  }
);

export const createTransfer = createAsyncThunk(
  'stores/createTransfer',
  async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  }
);

export const approveTransfer = createAsyncThunk(
  'stores/approveTransfer',
  async (transferId) => {
    const response = await api.put(`/transfers/${transferId}/approve`);
    return response.data;
  }
);

export const completeTransfer = createAsyncThunk(
  'stores/completeTransfer',
  async (transferId) => {
    const response = await api.put(`/transfers/${transferId}/complete`);
    return response.data;
  }
);

export const rejectTransfer = createAsyncThunk(
  'stores/rejectTransfer',
  async ({ transferId, notes }) => {
    const params = new URLSearchParams();
    if (notes) params.append('notes', notes);
    const response = await api.put(`/transfers/${transferId}/reject?${params}`);
    return response.data;
  }
);

export const fetchTransferStats = createAsyncThunk(
  'stores/fetchTransferStats',
  async () => {
    const response = await api.get('/transfers/stats/summary');
    return response.data;
  }
);

const storesSlice = createSlice({
  name: 'stores',
  initialState: {
    stores: [],
    transfers: [],
    stats: null,
    transferStats: null,
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
      // Fetch Stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Store
      .addCase(createStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores.push(action.payload);
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update Store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stores.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete Store
      .addCase(deleteStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.loading = false;
        const store = state.stores.find((s) => s.id === action.payload);
        if (store) store.is_active = false;
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Store Stats
      .addCase(fetchStoreStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch Transfers
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.transfers = action.payload;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Transfer
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.transfers.unshift(action.payload);
      })
      
      // Approve/Complete/Reject Transfer
      .addCase(approveTransfer.fulfilled, (state, action) => {
        const index = state.transfers.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.transfers[index] = action.payload;
      })
      .addCase(completeTransfer.fulfilled, (state, action) => {
        const index = state.transfers.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.transfers[index] = action.payload;
      })
      .addCase(rejectTransfer.fulfilled, (state, action) => {
        const index = state.transfers.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.transfers[index] = action.payload;
      })
      
      // Transfer Stats
      .addCase(fetchTransferStats.fulfilled, (state, action) => {
        state.transferStats = action.payload;
      });
  },
});

export const { clearError } = storesSlice.actions;
export default storesSlice.reducer;
