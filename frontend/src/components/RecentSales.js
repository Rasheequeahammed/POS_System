import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../styles/RecentSales.css';

function RecentSales() {
  const { recentSales, loading } = useSelector((state) => state.dashboard);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewAllSales = () => {
    navigate('/reports');
  };

  return (
    <div className="recent-sales-card">
      <div className="sales-header">
        <h2>🕒 Recent Transactions</h2>
        <button onClick={handleViewAllSales} className="view-all-btn">
          View All Sales
        </button>
      </div>

      {loading ? (
        <div className="sales-loading">Loading transactions...</div>
      ) : recentSales.length === 0 ? (
        <div className="sales-empty">
          <p>No transactions today</p>
        </div>
      ) : (
        <div className="sales-table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td>#{sale.invoice_number}</td>
                  <td>{formatDate(sale.sale_date)}</td>
                  <td>
                    {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                  </td>
                  <td>
                    <span className={`payment-badge ${sale.payment_method}`}>
                      {sale.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="amount">₹{parseFloat(sale.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentSales;
