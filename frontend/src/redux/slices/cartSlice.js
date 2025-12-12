import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    customer: null,
    paymentMethod: 'cash',
  },
  reducers: {
    addItem: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.lineTotal = existingItem.quantity * existingItem.unit_price;
      } else {
        state.items.push({
          id: product.id,
          product_id: product.id,
          product_name: product.name,
          barcode: product.barcode,
          unit_price: product.selling_price,
          quantity: 1,
          discount: 0,
          tax_rate: product.gst_rate,
          lineTotal: product.selling_price,
        });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
        item.lineTotal = item.quantity * item.unit_price;
      }
    },
    updateDiscount: (state, action) => {
      const { id, discount } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.discount = discount;
        item.lineTotal = (item.quantity * item.unit_price) - discount;
      }
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.customer = null;
      state.paymentMethod = 'cash';
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateDiscount,
  setCustomer,
  setPaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartTotal = (state) => {
  const subtotal = state.cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = state.cart.items.reduce((sum, item) => {
    const lineAfterDiscount = item.lineTotal;
    return sum + (lineAfterDiscount * item.tax_rate / 100);
  }, 0);
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
    itemCount: state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
};
