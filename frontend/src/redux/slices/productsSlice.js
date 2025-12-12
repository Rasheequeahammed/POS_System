import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ search, category } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch products');
    }
  }
);

export const fetchProductByBarcode = createAsyncThunk(
  'products/fetchProductByBarcode',
  async (barcode, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Product not found');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    loading: false,
    error: null,
    searchLoading: false,
    searchError: null,
  },
  reducers: {
    clearSearchError: (state) => {
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by Barcode
      .addCase(fetchProductByBarcode.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(fetchProductByBarcode.fulfilled, (state) => {
        state.searchLoading = false;
      })
      .addCase(fetchProductByBarcode.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  },
});

export const { clearSearchError } = productsSlice.actions;
export default productsSlice.reducer;
