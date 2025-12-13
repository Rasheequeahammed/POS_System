import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import salesReducer from './slices/salesSlice';
import dashboardReducer from './slices/dashboardSlice';
import customersReducer from './slices/customersSlice';
import purchasesReducer from './slices/purchasesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    sales: salesReducer,
    dashboard: dashboardReducer,
    customers: customersReducer,
    purchases: purchasesReducer,
  },
});

export default store;
