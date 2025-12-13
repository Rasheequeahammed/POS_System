import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import salesReducer from './slices/salesSlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    sales: salesReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
