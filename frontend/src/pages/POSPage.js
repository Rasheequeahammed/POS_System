import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, clearCart, removeItem, updateQuantity, selectCartTotal } from '../redux/slices/cartSlice';
import { fetchProductByBarcode, fetchProducts } from '../redux/slices/productsSlice';
import api from '../utils/api';
import '../styles/POSPage.css';

function POSPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { subtotal, taxAmount, total, itemCount } = useSelector(selectCartTotal);
  const { products } = useSelector((state) => state.products);
  const [barcode, setBarcode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    // Fetch all products on mount
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    // Auto-focus barcode input
    barcodeInputRef.current?.focus();
  }, [items]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    try {
      const result = await dispatch(fetchProductByBarcode(barcode)).unwrap();
      dispatch(addItem(result));
      setBarcode('');
    } catch (error) {
      alert(error || 'Product not found');
      setBarcode('');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
        })),
        payment_method: paymentMethod,
        customer_phone: customerPhone || null,
        discount_amount: discount,
      };

      const response = await api.post('/sales', saleData);
      alert(`Sale completed! Invoice: ${response.data.invoice_number}`);
      dispatch(clearCart());
      setCustomerPhone('');
      setDiscount(0);
      setPaymentMethod('cash');
    } catch (error) {
      alert('Sale failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleProductClick = (product) => {
    if (product.current_stock <= 0) {
      alert('Product out of stock');
      return;
    }
    dispatch(addItem({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.selling_price,
      barcode: product.barcode,
      quantity: 1,
      gst_rate: product.gst_rate || 0,
    }));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeItem(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: parseInt(newQuantity) }));
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set((products || []).map(p => p.category))];

  // Filter products
  const filteredProducts = (products || []).filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.is_active;
  });

  return (
    <div className="pos-container">
      <div className="pos-left">
        <div className="barcode-scanner">
          <form onSubmit={handleBarcodeSubmit}>
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or enter barcode..."
              className="barcode-input"
            />
          </form>
        </div>

        {/* Product Search and Filters */}
        <div className="product-search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="search-input"
          />
          
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="products-grid">
          {filteredProducts.slice(0, 12).map(product => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-name">{product.name}</div>
              <div className="product-price">₹{product.selling_price.toFixed(2)}</div>
              <div className="product-stock">Stock: {product.current_stock}</div>
            </div>
          ))}
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is empty</p>
              <p>Scan a product or click on product cards above</p>
            </div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>₹{item.unit_price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="qty-input"
                      />
                    </td>
                    <td>₹{item.lineTotal.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => dispatch(removeItem(item.id))}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pos-right">
        <div className="cart-summary">
          <h2>Cart Summary</h2>
          
          <div className="customer-section">
            <label>Customer Phone (Optional)</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              className="customer-input"
            />
          </div>

          <div className="payment-method-section">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-select"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="discount-section">
            <label>Discount (₹)</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="Enter discount amount"
              className="discount-input"
            />
          </div>
          
          <div className="summary-row">
            <span>Items:</span>
            <span>{itemCount}</span>
          </div>
          
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Discount:</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Tax (GST):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{(total - discount).toFixed(2)}</span>
          </div>

          <button 
            className="checkout-button"
            onClick={handleCheckout}
            disabled={processing || items.length === 0}
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>

          <button 
            className="clear-button"
            onClick={() => dispatch(clearCart())}
            disabled={items.length === 0}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default POSPage;
