import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSupplierById } from '../redux/slices/suppliersSlice';
import '../styles/SupplierDetailsModal.css';

function SupplierDetailsModal({ supplierId, onClose }) {
  const dispatch = useDispatch();
  const { selectedSupplier, loading } = useSelector((state) => state.suppliers);

  useEffect(() => {
    if (supplierId) {
      dispatch(fetchSupplierById(supplierId));
    }
  }, [dispatch, supplierId]);

  if (!supplierId) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'supplier-details-overlay') {
      onClose();
    }
  };

  return (
    <div className="supplier-details-overlay" onClick={handleOverlayClick}>
      <div className="supplier-details-modal">
        <div className="modal-header">
          <h2>🏭 Supplier Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading supplier details...</div>
        ) : selectedSupplier ? (
          <div className="modal-body">
            <div className="supplier-info-section">
              <h3>Company Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Company Name:</span>
                  <span className="info-value">{selectedSupplier.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact Person:</span>
                  <span className="info-value">{selectedSupplier.contact_person}</span>
                </div>
                {selectedSupplier.email && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedSupplier.email}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{selectedSupplier.phone}</span>
                </div>
                {selectedSupplier.gst_number && (
                  <div className="info-item">
                    <span className="info-label">GST Number:</span>
                    <span className="info-value">{selectedSupplier.gst_number}</span>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="info-item full-width">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{selectedSupplier.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="supplier-stats-section">
              <h3>Purchase Statistics</h3>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <span className="stat-label">Total Purchases</span>
                    <span className="stat-value">
                      {selectedSupplier.purchases?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-label">Total Amount</span>
                    <span className="stat-value">
                      ₹
                      {selectedSupplier.purchases
                        ?.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount || 0), 0)
                        .toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-info">
                    <span className="stat-label">Products Supplied</span>
                    <span className="stat-value">
                      {selectedSupplier.products?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedSupplier.purchases && selectedSupplier.purchases.length > 0 && (
              <div className="purchase-history-section">
                <h3>Recent Purchase History</h3>
                <div className="purchase-table-container">
                  <table className="purchase-table">
                    <thead>
                      <tr>
                        <th>Purchase ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplier.purchases.slice(0, 5).map((purchase) => (
                        <tr key={purchase.id}>
                          <td>#{purchase.id}</td>
                          <td>
                            {new Date(purchase.purchase_date).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            {purchase.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                          </td>
                          <td className="amount">₹{parseFloat(purchase.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`payment-badge ${purchase.payment_status}`}>
                              {purchase.payment_status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSupplier.products && selectedSupplier.products.length > 0 && (
              <div className="products-section">
                <h3>Products from this Supplier</h3>
                <div className="products-list">
                  {selectedSupplier.products.map((product) => (
                    <div key={product.id} className="product-item">
                      <span className="product-name">{product.name}</span>
                      <span className="product-category">{product.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="modal-error">Supplier not found</div>
        )}
      </div>
    </div>
  );
}

export default SupplierDetailsModal;
