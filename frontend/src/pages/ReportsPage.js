import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSalesReport,
  fetchInventoryReport,
  fetchPurchaseReport,
  fetchTaxReport,
  exportSalesCSV,
  exportInventoryCSV,
} from '../redux/slices/reportsSlice';
import './ReportsPage.css';

function ReportsPage() {
  const dispatch = useDispatch();
  const {
    salesReport,
    inventoryReport,
    purchaseReport,
    taxReport,
    loading,
    exportLoading,
    error,
  } = useSelector((state) => state.reports);

  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReport();
  }, [activeTab, dispatch]);

  const loadReport = () => {
    switch (activeTab) {
      case 'sales':
        dispatch(fetchSalesReport(dateRange));
        break;
      case 'inventory':
        dispatch(fetchInventoryReport());
        break;
      case 'purchases':
        dispatch(fetchPurchaseReport(dateRange));
        break;
      case 'tax':
        dispatch(fetchTaxReport(dateRange));
        break;
      default:
        break;
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  const handleApplyFilter = () => {
    loadReport();
  };

  const handleExport = (format) => {
    switch (activeTab) {
      case 'sales':
        dispatch(exportSalesCSV(dateRange));
        break;
      case 'inventory':
        dispatch(exportInventoryCSV());
        break;
      default:
        alert('Export functionality for this report coming soon!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSalesReport = () => {
    if (!salesReport) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>Sales Report</h2>
          <p className="report-period">
            {new Date(salesReport.period.start_date).toLocaleDateString()} -{' '}
            {new Date(salesReport.period.end_date).toLocaleDateString()}
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p className="value">{salesReport.summary.total_sales}</p>
          </div>
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <p className="value">${salesReport.summary.total_revenue.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Average Sale</h3>
            <p className="value">${salesReport.summary.average_sale.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Tax</h3>
            <p className="value">${salesReport.summary.total_tax.toFixed(2)}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>Top Products</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.top_products.map((product, index) => (
                <tr key={index}>
                  <td>{product.product_name}</td>
                  <td>{product.quantity_sold}</td>
                  <td>${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3>Sales by User</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Sales Count</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.sales_by_user.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.sales_count}</td>
                  <td>${user.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salesReport.payment_methods && salesReport.payment_methods.length > 0 && (
          <div className="report-section">
            <h3>Payment Methods</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.payment_methods.map((method, index) => (
                  <tr key={index}>
                    <td>{method.method}</td>
                    <td>${method.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryReport) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>Inventory Report</h2>
          <p className="report-period">As of {new Date().toLocaleDateString()}</p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Products</h3>
            <p className="value">{inventoryReport.summary.total_products}</p>
          </div>
          <div className="summary-card">
            <h3>Stock Value</h3>
            <p className="value">${inventoryReport.summary.total_stock_value.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Potential Profit</h3>
            <p className="value">${inventoryReport.summary.potential_profit.toLocaleString()}</p>
          </div>
          <div className="summary-card warning">
            <h3>Low Stock Items</h3>
            <p className="value">{inventoryReport.summary.low_stock_count}</p>
          </div>
        </div>

        {inventoryReport.categories.map((category, index) => (
          <div key={index} className="report-section">
            <h3>{category.category}</h3>
            <p className="category-summary">
              {category.product_count} products | Stock Value: ${category.stock_value.toFixed(2)}
            </p>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Product Name</th>
                  <th>Stock</th>
                  <th>Min. Stock</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {category.products.map((product, pIndex) => (
                  <tr key={pIndex}>
                    <td>{product.barcode}</td>
                    <td>{product.name}</td>
                    <td>{product.current_stock}</td>
                    <td>{product.minimum_stock}</td>
                    <td>${product.cost_price}</td>
                    <td>${product.selling_price}</td>
                    <td>${product.stock_value}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderPurchaseReport = () => {
    if (!purchaseReport) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>Purchase Report</h2>
          <p className="report-period">
            {new Date(purchaseReport.period.start_date).toLocaleDateString()} -{' '}
            {new Date(purchaseReport.period.end_date).toLocaleDateString()}
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Purchases</h3>
            <p className="value">{purchaseReport.summary.total_purchases}</p>
          </div>
          <div className="summary-card">
            <h3>Total Amount</h3>
            <p className="value">${purchaseReport.summary.total_amount.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Total Paid</h3>
            <p className="value">${purchaseReport.summary.total_paid.toLocaleString()}</p>
          </div>
          <div className="summary-card warning">
            <h3>Pending Payment</h3>
            <p className="value">${purchaseReport.summary.total_pending.toLocaleString()}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>By Supplier</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Purchases</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReport.by_supplier.map((supplier, index) => (
                <tr key={index}>
                  <td>{supplier.supplier_name}</td>
                  <td>{supplier.purchase_count}</td>
                  <td>${supplier.total_amount.toFixed(2)}</td>
                  <td>${supplier.paid_amount.toFixed(2)}</td>
                  <td>${supplier.pending.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h3>Top Purchases</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReport.top_purchases.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTaxReport = () => {
    if (!taxReport) return null;

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>Tax Report</h2>
          <p className="report-period">
            {new Date(taxReport.period.start_date).toLocaleDateString()} -{' '}
            {new Date(taxReport.period.end_date).toLocaleDateString()}
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p className="value">{taxReport.summary.total_sales}</p>
          </div>
          <div className="summary-card">
            <h3>Taxable Amount</h3>
            <p className="value">${taxReport.summary.taxable_amount.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Tax Collected</h3>
            <p className="value">${taxReport.summary.total_tax_collected.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Average Tax/Sale</h3>
            <p className="value">${taxReport.summary.average_tax_per_sale.toFixed(2)}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>Tax Breakdown by Rate</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Tax Rate (%)</th>
                <th>Taxable Amount</th>
                <th>Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {taxReport.by_tax_rate.map((rate, index) => (
                <tr key={index}>
                  <td>{rate.tax_rate}%</td>
                  <td>${rate.taxable_amount.toFixed(2)}</td>
                  <td>${rate.tax_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="page-header no-print">
        <h1>Reports & Exports</h1>
        <div className="header-actions">
          <button className="btn-action" onClick={handlePrint} disabled={loading}>
            🖨️ Print
          </button>
          <button
            className="btn-action"
            onClick={() => handleExport('csv')}
            disabled={exportLoading || loading}
          >
            {exportLoading ? '⏳ Exporting...' : '📊 Export CSV'}
          </button>
        </div>
      </div>

      <div className="tabs no-print">
        <button
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Report
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Report
        </button>
        <button
          className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchase Report
        </button>
        <button
          className={`tab ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          Tax Report
        </button>
      </div>

      {(activeTab === 'sales' || activeTab === 'purchases' || activeTab === 'tax') && (
        <div className="filters-section no-print">
          <div className="date-filters">
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
            <button className="btn-apply" onClick={handleApplyFilter}>
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading report...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <>
          {activeTab === 'sales' && renderSalesReport()}
          {activeTab === 'inventory' && renderInventoryReport()}
          {activeTab === 'purchases' && renderPurchaseReport()}
          {activeTab === 'tax' && renderTaxReport()}
        </>
      )}
    </div>
  );
}

export default ReportsPage;
