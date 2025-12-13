import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchaseById } from '../redux/slices/purchasesSlice';
import '../styles/PurchaseDetailsModal.css';

function PurchaseDetailsModal({ purchaseId, onClose }) {
  const dispatch = useDispatch();
  const { selectedPurchase, loading } = useSelector((state) => state.purchases);

  useEffect(() => {
    if (purchaseId) {
      dispatch(fetchPurchaseById(purchaseId));
    }
  }, [dispatch, purchaseId]);

  if (!purchaseId) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'purchase-details-overlay') {
      onClose();
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'partial':
        return 'status-partial';
      default:
        return '';
    }
  };

  return (
    <div className="purchase-details-overlay" onClick={handleOverlayClick}>
      <div className="purchase-details-modal">
        <div className="modal-header">
          <h2>📦 Purchase Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading purchase details...</div>
        ) : selectedPurchase ? (
          <div className="modal-body">
            <div className="purchase-info-section">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Purchase ID:</span>
                  <span className="info-value">#{selectedPurchase.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Supplier:</span>
                  <span className="info-value">{selectedPurchase.supplier?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Purchase Date:</span>
                  <span className="info-value">
                    {new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedPurchase.payment_status)}`}>
                    {selectedPurchase.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div className="notes-section">
                  <span className="info-label">Notes:</span>
                  <p className="notes-text">{selectedPurchase.notes}</p>
                </div>
              )}
            </div>

            <div className="items-section">
              <h3>Items Purchased</h3>
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="product-name">{item.product?.name || 'Unknown'}</td>
                        <td>{item.quantity} units</td>
                        <td>₹{parseFloat(item.unit_cost).toFixed(2)}</td>
                        <td className="subtotal">
                          ₹{(item.quantity * parseFloat(item.unit_cost)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">
                        Total Amount
                      </td>
                      <td className="total-amount">
                        ₹{parseFloat(selectedPurchase.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-error">Purchase not found</div>
        )}
      </div>
    </div>
  );
}

export default PurchaseDetailsModal;
