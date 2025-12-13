import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateReorderPoint } from '../redux/slices/inventorySlice';
import './ReorderPointModal.css';

function ReorderPointModal({ product, onClose }) {
  const dispatch = useDispatch();
  const [minimumStock, setMinimumStock] = useState(product.minimum_stock || 5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const minStock = parseInt(minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      setError('Please enter a valid minimum stock level (0 or greater)');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        updateReorderPoint({
          productId: product.id,
          minimumStock: minStock,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update reorder point');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = () => {
    // Simple recommendation: 3x current minimum or 10, whichever is higher
    return Math.max(10, (product.minimum_stock || 5) * 3);
  };

  const getStockStatus = () => {
    if (product.current_stock === 0) return { text: 'Out of Stock', class: 'critical' };
    if (product.current_stock <= product.minimum_stock) return { text: 'Low Stock', class: 'warning' };
    return { text: 'In Stock', class: 'ok' };
  };

  const status = getStockStatus();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reorder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Set Reorder Point</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-barcode">{product.barcode}</p>
          <div className="stock-status-display">
            <div className="status-item">
              <span className="label">Current Stock:</span>
              <span className="value">{product.current_stock} units</span>
            </div>
            <div className="status-item">
              <span className="label">Status:</span>
              <span className={`status-badge ${status.class}`}>{status.text}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Minimum Stock Level (Reorder Point) *</label>
            <input
              type="number"
              min="0"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              placeholder="Enter minimum stock level"
              required
            />
            <div className="field-help">
              When stock falls to or below this level, you'll receive a low stock alert.
            </div>
          </div>

          <div className="info-box">
            <div className="info-header">
              <span className="info-icon">💡</span>
              <span className="info-title">Recommendation</span>
            </div>
            <p>
              Based on typical usage patterns, we recommend setting the minimum stock to at least{' '}
              <strong>{getRecommendation()} units</strong> for this product.
            </p>
            <button
              type="button"
              className="btn-link"
              onClick={() => setMinimumStock(getRecommendation())}
            >
              Use recommended value
            </button>
          </div>

          <div className="comparison-table">
            <h4>Comparison</h4>
            <table>
              <tbody>
                <tr>
                  <td>Current Reorder Point:</td>
                  <td className="value-old">{product.minimum_stock} units</td>
                </tr>
                <tr>
                  <td>New Reorder Point:</td>
                  <td className="value-new">{minimumStock || 0} units</td>
                </tr>
                <tr>
                  <td>Change:</td>
                  <td className={parseInt(minimumStock) > product.minimum_stock ? 'positive' : 'negative'}>
                    {parseInt(minimumStock) - product.minimum_stock > 0 ? '+' : ''}
                    {parseInt(minimumStock || 0) - product.minimum_stock} units
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Reorder Point'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReorderPointModal;
