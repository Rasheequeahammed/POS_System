import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adjustStock } from '../redux/slices/inventorySlice';
import './StockAdjustmentModal.css';

function StockAdjustmentModal({ product, onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    adjustmentType: 'RESTOCK',
    quantityChange: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const adjustmentTypes = [
    { value: 'RESTOCK', label: 'Restock (Add Stock)', sign: '+' },
    { value: 'DAMAGE', label: 'Damage/Defect (Remove)', sign: '-' },
    { value: 'LOSS', label: 'Loss/Theft (Remove)', sign: '-' },
    { value: 'RETURN', label: 'Customer Return (Add)', sign: '+' },
    { value: 'CORRECTION', label: 'Stock Correction', sign: '±' },
    { value: 'TRANSFER', label: 'Transfer Out (Remove)', sign: '-' },
  ];

  const selectedType = adjustmentTypes.find((t) => t.value === formData.adjustmentType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const quantity = parseInt(formData.quantityChange);
    if (isNaN(quantity) || quantity === 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // For removal types, ensure quantity is negative
    const isRemovalType = ['DAMAGE', 'LOSS', 'TRANSFER'].includes(formData.adjustmentType);
    const finalQuantity = isRemovalType && quantity > 0 ? -quantity : quantity;

    // Check if removal would result in negative stock
    if (product.current_stock + finalQuantity < 0) {
      setError(`Cannot remove ${Math.abs(finalQuantity)} units. Only ${product.current_stock} in stock.`);
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        adjustStock({
          productId: product.id,
          adjustmentType: formData.adjustmentType,
          quantityChange: finalQuantity,
          reason: formData.reason,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    // Allow empty string for clearing the field
    if (value === '') {
      setFormData({ ...formData, quantityChange: '' });
      return;
    }
    // Convert to number, keep as is if valid
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      // Always store as positive number, sign is determined by adjustment type
      setFormData({ ...formData, quantityChange: Math.abs(quantity) });
    }
  };

  const calculateNewStock = () => {
    const quantity = parseInt(formData.quantityChange) || 0;
    const isRemovalType = ['DAMAGE', 'LOSS', 'TRANSFER'].includes(formData.adjustmentType);
    const finalQuantity = isRemovalType && quantity > 0 ? -quantity : quantity;
    return product.current_stock + finalQuantity;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjust Stock</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-barcode">{product.barcode}</p>
          <div className="current-stock-display">
            <span className="label">Current Stock:</span>
            <span className="value">{product.current_stock} units</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adjustment Type *</label>
            <select
              value={formData.adjustmentType}
              onChange={(e) =>
                setFormData({ ...formData, adjustmentType: e.target.value })
              }
              required
            >
              {adjustmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <div className="quantity-input-group">
              <span className="quantity-sign">{selectedType.sign}</span>
              <input
                type="number"
                min="1"
                value={formData.quantityChange}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="quantity-help">
              Enter positive number. System will adjust sign automatically for removals.
            </div>
          </div>

          {formData.quantityChange && (
            <div className="stock-preview">
              <div className="preview-row">
                <span>Current Stock:</span>
                <span>{product.current_stock}</span>
              </div>
              <div className="preview-row">
                <span>Change:</span>
                <span className={parseInt(formData.quantityChange) > 0 ? 'positive' : 'negative'}>
                  {['DAMAGE', 'LOSS', 'TRANSFER'].includes(formData.adjustmentType) && parseInt(formData.quantityChange) > 0
                    ? '-'
                    : '+'}
                  {Math.abs(parseInt(formData.quantityChange) || 0)}
                </span>
              </div>
              <div className="preview-row new-stock">
                <span>New Stock:</span>
                <span>{calculateNewStock()}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Reason (Optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Add notes about this stock adjustment..."
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adjusting...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockAdjustmentModal;
