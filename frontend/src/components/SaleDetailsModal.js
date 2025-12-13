import React from 'react';
import '../styles/SaleDetailsModal.css';

const SaleDetailsModal = ({ sale, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sale-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sale Details - Invoice #{sale.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="sale-info">
          <div className="info-row">
            <span className="label">Date & Time:</span>
            <span className="value">{formatDate(sale.sale_date)}</span>
          </div>
          <div className="info-row">
            <span className="label">Customer:</span>
            <span className="value">{sale.customer_name || 'Walk-in Customer'}</span>
          </div>
          <div className="info-row">
            <span className="label">Payment Method:</span>
            <span className={`value payment-badge ${sale.payment_method?.toLowerCase()}`}>
              {sale.payment_method || 'CASH'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Cashier:</span>
            <span className="value">{sale.cashier_name || 'N/A'}</span>
          </div>
        </div>

        <div className="items-section">
          <h3>Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name || `Product #${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>₹{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(item.tax_amount || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(item.total_price || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals-section">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>₹{parseFloat(sale.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Discount:</span>
            <span>-₹{parseFloat(sale.discount_amount || 0).toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>GST:</span>
            <span>₹{parseFloat(sale.tax_amount || 0).toFixed(2)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Grand Total:</span>
            <span>₹{parseFloat(sale.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={() => window.print()}>
            Print Invoice
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;
