import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import salesReducer from './slices/salesSlice';
import dashboardReducer from './slices/dashboardSlice';
import customersReducer from './slices/customersSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    sales: salesReducer,
    dashboard: dashboardReducer,
    customers: customersReducer,
  },
});

export default store;
