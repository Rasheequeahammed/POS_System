import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerById } from '../redux/slices/customersSlice';
import '../styles/CustomerDetailsModal.css';

function CustomerDetailsModal({ customerId, onClose }) {
  const dispatch = useDispatch();
  const { selectedCustomer, loading } = useSelector((state) => state.customers);

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [dispatch, customerId]);

  if (!customerId) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'customer-details-overlay') {
      onClose();
    }
  };

  return (
    <div className="customer-details-overlay" onClick={handleOverlayClick}>
      <div className="customer-details-modal">
        <div className="modal-header">
          <h2>👤 Customer Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading customer details...</div>
        ) : selectedCustomer ? (
          <div className="modal-body">
            <div className="customer-info-section">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedCustomer.email}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.address && (
                  <div className="info-item">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="customer-stats-section">
              <h3>Purchase Statistics</h3>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">🛍️</div>
                  <div className="stat-info">
                    <span className="stat-label">Total Purchases</span>
                    <span className="stat-value">
                      {selectedCustomer.sales?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-label">Total Spent</span>
                    <span className="stat-value">
                      ₹
                      {selectedCustomer.sales
                        ?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
                        .toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedCustomer.sales && selectedCustomer.sales.length > 0 && (
              <div className="purchase-history-section">
                <h3>Recent Purchase History</h3>
                <div className="purchase-table-container">
                  <table className="purchase-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.sales.slice(0, 5).map((sale) => (
                        <tr key={sale.id}>
                          <td>#{sale.invoice_number}</td>
                          <td>
                            {new Date(sale.sale_date).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                          </td>
                          <td className="amount">₹{parseFloat(sale.total_amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="modal-error">Customer not found</div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetailsModal;
