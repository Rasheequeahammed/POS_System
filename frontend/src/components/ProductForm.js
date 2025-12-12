import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../redux/slices/productsSlice';
import '../styles/ProductForm.css';

const ProductForm = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    category: '',
    cost_price: '',
    selling_price: '',
    mrp: '',
    current_stock: '',
    minimum_stock: 5,
    hsn_code: '',
    gst_rate: 0,
    supplier_id: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        cost_price: product.cost_price || '',
        selling_price: product.selling_price || '',
        mrp: product.mrp || '',
        current_stock: product.current_stock || '',
        minimum_stock: product.minimum_stock || 5,
        hsn_code: product.hsn_code || '',
        gst_rate: product.gst_rate || 0,
        supplier_id: product.supplier_id || null,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.barcode.trim()) newErrors.barcode = 'Barcode is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
      newErrors.cost_price = 'Valid cost price is required';
    }
    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Valid selling price is required';
    }
    if (!formData.current_stock || parseInt(formData.current_stock) < 0) {
      newErrors.current_stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        current_stock: parseInt(formData.current_stock),
        minimum_stock: parseInt(formData.minimum_stock),
        gst_rate: parseFloat(formData.gst_rate),
      };

      if (product) {
        await dispatch(updateProduct({ id: product.id, data: productData }));
      } else {
        await dispatch(createProduct(productData));
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Barcode *</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                disabled={!!product}
                className={errors.barcode ? 'error' : ''}
              />
              {errors.barcode && <span className="error-text">{errors.barcode}</span>}
            </div>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Perfumes, Alcohol, Chocolates"
                className={errors.category ? 'error' : ''}
              />
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>HSN Code</label>
              <input
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Cost Price (₹) *</label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.cost_price ? 'error' : ''}
              />
              {errors.cost_price && <span className="error-text">{errors.cost_price}</span>}
            </div>

            <div className="form-group">
              <label>Selling Price (₹) *</label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.selling_price ? 'error' : ''}
              />
              {errors.selling_price && <span className="error-text">{errors.selling_price}</span>}
            </div>

            <div className="form-group">
              <label>MRP (₹)</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Maximum Retail Price"
              />
            </div>

            <div className="form-group">
              <label>GST Rate (%)</label>
              <select
                name="gst_rate"
                value={formData.gst_rate}
                onChange={handleChange}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Stock *</label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                min="0"
                className={errors.current_stock ? 'error' : ''}
              />
              {errors.current_stock && <span className="error-text">{errors.current_stock}</span>}
            </div>

            <div className="form-group">
              <label>Minimum Stock Level</label>
              <input
                type="number"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Product details, features, etc."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
