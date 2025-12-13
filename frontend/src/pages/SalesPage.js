import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales } from '../redux/slices/salesSlice';
import SalesStats from '../components/SalesStats';
import SaleDetailsModal from '../components/SaleDetailsModal';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const dispatch = useDispatch();
  const { items: sales, loading, error, stats } = useSelector((state) => state.sales);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
  });
  
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSales(filters));
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    dispatch(fetchSales(filters));
  };

  const handleResetFilters = () => {
    const resetFilters = { startDate: '', endDate: '', paymentMethod: '' };
    setFilters(resetFilters);
    dispatch(fetchSales(resetFilters));
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && sales.length === 0) return <div className="loading">Loading sales...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>Sales Reports & Analytics</h1>
      </div>

      <SalesStats stats={stats} />

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
            >
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
            <button className="btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No sales found. Start making sales to see them here!
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="invoice-number">#{sale.id}</td>
                  <td>{formatDate(sale.sale_date)}</td>
                  <td>{sale.customer_name || 'Walk-in'}</td>
                  <td>{sale.items?.length || 0}</td>
                  <td>₹{parseFloat(sale.subtotal || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(sale.tax_amount || 0).toFixed(2)}</td>
                  <td className="total-amount">₹{parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`payment-badge ${sale.payment_method?.toLowerCase()}`}>
                      {sale.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewDetails(sale)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SalesPage;
