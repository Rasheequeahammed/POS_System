import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch sales trends over time
export const fetchSalesTrends = createAsyncThunk(
  'analytics/fetchSalesTrends',
  async ({ startDate, endDate, interval = 'daily' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/sales-trends', {
        params: { start_date: startDate, end_date: endDate, interval },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch sales trends');
    }
  }
);

// Fetch profit analysis
export const fetchProfitAnalysis = createAsyncThunk(
  'analytics/fetchProfitAnalysis',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/profit-analysis', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profit analysis');
    }
  }
);

// Fetch top products
export const fetchTopProducts = createAsyncThunk(
  'analytics/fetchTopProducts',
  async ({ startDate, endDate, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/top-products', {
        params: { start_date: startDate, end_date: endDate, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch top products');
    }
  }
);

// Fetch customer insights
export const fetchCustomerInsights = createAsyncThunk(
  'analytics/fetchCustomerInsights',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/customer-insights', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customer insights');
    }
  }
);

// Fetch revenue by category
export const fetchRevenueByCategory = createAsyncThunk(
  'analytics/fetchRevenueByCategory',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/revenue-by-category', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch revenue by category');
    }
  }
);

// Fetch comprehensive analytics dashboard data
export const fetchAnalyticsDashboard = createAsyncThunk(
  'analytics/fetchAnalyticsDashboard',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/dashboard', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch analytics dashboard');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    salesTrends: {
      data: [],
      comparison: null,
      growth: 0,
    },
    profitAnalysis: {
      gross_profit: 0,
      net_profit: 0,
      profit_margin: 0,
      by_category: [],
      by_product: [],
    },
    topProducts: [],
    customerInsights: {
      total_customers: 0,
      new_customers: 0,
      returning_customers: 0,
      average_purchase_value: 0,
      purchase_frequency: 0,
      customer_lifetime_value: 0,
    },
    revenueByCategory: [],
    dashboardData: null,
    loading: false,
    error: null,
    dateRange: {
      startDate: null,
      endDate: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearAnalytics: (state) => {
      state.salesTrends = { data: [], comparison: null, growth: 0 };
      state.profitAnalysis = {
        gross_profit: 0,
        net_profit: 0,
        profit_margin: 0,
        by_category: [],
        by_product: [],
      };
      state.topProducts = [];
      state.customerInsights = {
        total_customers: 0,
        new_customers: 0,
        returning_customers: 0,
        average_purchase_value: 0,
        purchase_frequency: 0,
        customer_lifetime_value: 0,
      };
      state.revenueByCategory = [];
      state.dashboardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sales Trends
      .addCase(fetchSalesTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.salesTrends = action.payload;
      })
      .addCase(fetchSalesTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Profit Analysis
      .addCase(fetchProfitAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.profitAnalysis = action.payload;
      })
      .addCase(fetchProfitAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Top Products
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Customer Insights
      .addCase(fetchCustomerInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInsights = action.payload;
      })
      .addCase(fetchCustomerInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Revenue By Category
      .addCase(fetchRevenueByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueByCategory = action.payload;
      })
      .addCase(fetchRevenueByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Analytics Dashboard
      .addCase(fetchAnalyticsDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        // Update individual sections if included
        if (action.payload.sales_trends) state.salesTrends = action.payload.sales_trends;
        if (action.payload.profit_analysis) state.profitAnalysis = action.payload.profit_analysis;
        if (action.payload.top_products) state.topProducts = action.payload.top_products;
        if (action.payload.customer_insights) state.customerInsights = action.payload.customer_insights;
        if (action.payload.revenue_by_category) state.revenueByCategory = action.payload.revenue_by_category;
      })
      .addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setDateRange, clearAnalytics } = analyticsSlice.actions;

export default analyticsSlice.reducer;
