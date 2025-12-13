import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch today's data
      const today = new Date().toISOString().split('T')[0];
      
      const [salesRes, productsRes] = await Promise.all([
        api.get(`/sales?start_date=${today}`),
        api.get('/products'),
      ]);

      const sales = salesRes.data;
      const products = productsRes.data;

      // Calculate stats
      const todayRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
      const todaySales = sales.length;
      const todayItems = sales.reduce((sum, sale) => 
        sum + (sale.items?.reduce((s, item) => s + item.quantity, 0) || 0), 0
      );
      
      const lowStockProducts = products.filter(p => p.current_stock <= p.minimum_stock);
      const totalProducts = products.length;

      return {
        todayRevenue,
        todaySales,
        todayItems,
        lowStockCount: lowStockProducts.length,
        totalProducts,
        recentSales: sales.slice(0, 5),
        lowStockProducts,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (period = 'week', { rejectWithValue }) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const response = await api.get('/sales', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      });

      const sales = response.data;
      
      // Group sales by date
      const salesByDate = {};
      sales.forEach(sale => {
        const date = sale.sale_date.split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = 0;
        }
        salesByDate[date] += parseFloat(sale.total_amount || 0);
      });

      return {
        period,
        data: salesByDate,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch sales chart');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      todayRevenue: 0,
      todaySales: 0,
      todayItems: 0,
      lowStockCount: 0,
      totalProducts: 0,
    },
    recentSales: [],
    lowStockProducts: [],
    chartData: {},
    chartPeriod: 'week',
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
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = {
          todayRevenue: action.payload.todayRevenue,
          todaySales: action.payload.todaySales,
          todayItems: action.payload.todayItems,
          lowStockCount: action.payload.lowStockCount,
          totalProducts: action.payload.totalProducts,
        };
        state.recentSales = action.payload.recentSales;
        state.lowStockProducts = action.payload.lowStockProducts;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales Chart
      .addCase(fetchSalesChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload.data;
        state.chartPeriod = action.payload.period;
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
