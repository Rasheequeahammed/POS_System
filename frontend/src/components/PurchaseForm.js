import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productsSlice';
import api from '../utils/api';
import '../styles/PurchaseForm.css';

function PurchaseForm({ onSubmit, onCancel }) {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    payment_status: 'paid',
    notes: '',
  });

  const [purchaseItems, setPurchaseItems] = useState([
    { product_id: '', quantity: 1, unit_cost: 0 },
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProducts());
    fetchSuppliers();
  }, [dispatch]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  useEffect(() => {
    // Calculate total amount
    const total = purchaseItems.reduce(
      (sum, item) => sum + (parseFloat(item.unit_cost) || 0) * (parseInt(item.quantity) || 0),
      0
    );
    setFormData((prev) => ({ ...prev, total_amount: total }));
  }, [purchaseItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    setPurchaseItems(newItems);
  };

  const handleAddItem = () => {
    setPurchaseItems([...purchaseItems, { product_id: '', quantity: 1, unit_cost: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Please select a supplier';
    }

    if (!formData.purchase_date) {
      newErrors.purchase_date = 'Purchase date is required';
    }

    const hasInvalidItems = purchaseItems.some(
      (item) => !item.product_id || item.quantity <= 0 || item.unit_cost <= 0
    );

    if (hasInvalidItems) {
      newErrors.items = 'All items must have valid product, quantity, and cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        items: purchaseItems.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost),
        })),
      };
      onSubmit(submitData);
    }
  };

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="supplier_id">Supplier *</label>
          <select
            id="supplier_id"
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            className={errors.supplier_id ? 'error' : ''}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplier_id && <span className="error-message">{errors.supplier_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="purchase_date">Purchase Date *</label>
          <input
            type="date"
            id="purchase_date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className={errors.purchase_date ? 'error' : ''}
          />
          {errors.purchase_date && <span className="error-message">{errors.purchase_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="payment_status">Payment Status</label>
          <select
            id="payment_status"
            name="payment_status"
            value={formData.payment_status}
            onChange={handleChange}
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="items-section">
        <h3>Purchase Items</h3>
        {errors.items && <div className="error-message">{errors.items}</div>}
        
        {purchaseItems.map((item, index) => (
          <div key={index} className="item-row">
            <div className="form-group">
              <label>Product *</label>
              <select
                value={item.product_id}
                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current: {product.current_stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Unit Cost (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_cost}
                onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Subtotal</label>
              <input
                type="text"
                value={`₹${(item.quantity * item.unit_cost).toFixed(2)}`}
                disabled
                className="subtotal-input"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="btn-remove-item"
              disabled={purchaseItems.length === 1}
            >
              ✕
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} className="btn-add-item">
          + Add Item
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Optional notes about this purchase..."
          rows="3"
        />
      </div>

      <div className="total-section">
        <h3>Total Amount: ₹{formData.total_amount.toFixed(2)}</h3>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn-submit">
          Record Purchase
        </button>
      </div>
    </form>
  );
}

export default PurchaseForm;
