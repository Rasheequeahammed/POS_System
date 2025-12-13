import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch all settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch settings');
    }
  }
);

// Update store information
export const updateStoreInfo = createAsyncThunk(
  'settings/updateStoreInfo',
  async (storeInfo, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/store', storeInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update store information');
    }
  }
);

// Update receipt settings
export const updateReceiptSettings = createAsyncThunk(
  'settings/updateReceiptSettings',
  async (receiptSettings, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/receipt', receiptSettings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update receipt settings');
    }
  }
);

// Update system settings
export const updateSystemSettings = createAsyncThunk(
  'settings/updateSystemSettings',
  async (systemSettings, { rejectWithValue }) => {
    try {
      const response = await api.put('/settings/system', systemSettings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update system settings');
    }
  }
);

// Upload store logo
export const uploadStoreLogo = createAsyncThunk(
  'settings/uploadStoreLogo',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload logo');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    storeInfo: {
      business_name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      gst_number: '',
      logo_url: null,
    },
    receiptSettings: {
      show_logo: true,
      header_text: '',
      footer_text: 'Thank you for your business!',
      show_gst: true,
      show_barcode: true,
      terms_conditions: '',
    },
    systemSettings: {
      currency: 'INR',
      currency_symbol: '₹',
      date_format: 'DD/MM/YYYY',
      time_format: '12',
      low_stock_threshold: 10,
      default_gst_rate: 18,
      tax_inclusive: false,
    },
    loading: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    setStoreInfo: (state, action) => {
      state.storeInfo = { ...state.storeInfo, ...action.payload };
    },
    setReceiptSettings: (state, action) => {
      state.receiptSettings = { ...state.receiptSettings, ...action.payload };
    },
    setSystemSettings: (state, action) => {
      state.systemSettings = { ...state.systemSettings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = action.payload.store_info || state.storeInfo;
        state.receiptSettings = action.payload.receipt_settings || state.receiptSettings;
        state.systemSettings = action.payload.system_settings || state.systemSettings;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update store info
      .addCase(updateStoreInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateStoreInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateStoreInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update receipt settings
      .addCase(updateReceiptSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateReceiptSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.receiptSettings = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateReceiptSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update system settings
      .addCase(updateSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload logo
      .addCase(uploadStoreLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadStoreLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo.logo_url = action.payload.logo_url;
        state.updateSuccess = true;
      })
      .addCase(uploadStoreLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearUpdateSuccess,
  setStoreInfo,
  setReceiptSettings,
  setSystemSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
