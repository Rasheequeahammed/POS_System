import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, clearCart, selectCartTotal } from '../redux/slices/cartSlice';
import { fetchProductByBarcode } from '../redux/slices/productsSlice';
import api from '../utils/api';
import '../styles/POSPage.css';

function POSPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { subtotal, taxAmount, total, itemCount } = useSelector(selectCartTotal);
  const [barcode, setBarcode] = useState('');
  const [processing, setProcessing] = useState(false);
  const barcodeInputRef = useRef(null);

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
        payment_method: 'cash',
      };

      const response = await api.post('/sales', saleData);
      alert(`Sale completed! Invoice: ${response.data.invoice_number}`);
      dispatch(clearCart());
    } catch (error) {
      alert('Sale failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setProcessing(false);
    }
  };

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

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is empty</p>
              <p>Scan a product to start</p>
            </div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>₹{item.unit_price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.lineTotal.toFixed(2)}</td>
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
          
          <div className="summary-row">
            <span>Items:</span>
            <span>{itemCount}</span>
          </div>
          
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Tax (GST):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
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
