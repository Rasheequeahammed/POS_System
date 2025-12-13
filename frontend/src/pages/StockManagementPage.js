import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventory,
  fetchLowStockAlerts,
  fetchInventorySummary,
  fetchCategories,
} from '../redux/slices/inventorySlice';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import ReorderPointModal from '../components/ReorderPointModal';
import './StockManagementPage.css';

function StockManagementPage() {
  const dispatch = useDispatch();
  const { items, total, lowStockAlerts, summary, categories, loading, error } = useSelector(
    (state) => state.inventory
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'alerts'

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchInventorySummary());
    dispatch(fetchLowStockAlerts());
    dispatch(fetchCategories());
    dispatch(fetchInventory({ lowStockOnly: showLowStockOnly }));
  };

  const handleSearch = () => {
    dispatch(
      fetchInventory({
        search: searchTerm,
        category: selectedCategory,
        lowStockOnly: showLowStockOnly,
      })
    );
  };

  const handleFilter = () => {
    dispatch(
      fetchInventory({
        search: searchTerm,
        category: selectedCategory,
        lowStockOnly: showLowStockOnly,
      })
    );
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setShowAdjustmentModal(true);
  };

  const handleSetReorderPoint = (product) => {
    setSelectedProduct(product);
    setShowReorderModal(true);
  };

  const handleModalClose = () => {
    setShowAdjustmentModal(false);
    setShowReorderModal(false);
    setSelectedProduct(null);
    loadData();
  };

  const getStockStatusBadge = (status) => {
    const badges = {
      ok: { class: 'status-ok', text: 'In Stock' },
      low_stock: { class: 'status-low', text: 'Low Stock' },
      out_of_stock: { class: 'status-out', text: 'Out of Stock' },
    };
    const badge = badges[status] || badges.ok;
    return <span className={`stock-badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="stock-management-page">
      <div className="page-header">
        <h1>Stock Management</h1>
        <button className="btn-refresh" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-value">{summary.total_products}</div>
            <div className="card-label">Total Products</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-value">${summary.total_inventory_value.toLocaleString()}</div>
            <div className="card-label">Inventory Value</div>
          </div>
        </div>
        <div className="summary-card warning">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <div className="card-value">{summary.low_stock_count}</div>
            <div className="card-label">Low Stock Items</div>
          </div>
        </div>
        <div className="summary-card critical">
          <div className="card-icon">🚨</div>
          <div className="card-content">
            <div className="card-value">{summary.out_of_stock_count}</div>
            <div className="card-label">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Inventory ({total})
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Low Stock Alerts ({lowStockAlerts.total_alerts})
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'all' && (
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>🔍 Search</button>
          </div>
          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setTimeout(handleFilter, 0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => {
                  setShowLowStockOnly(e.target.checked);
                  setTimeout(handleFilter, 0);
                }}
              />
              Show Low Stock Only
            </label>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <>
          {activeTab === 'all' ? (
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min. Stock</th>
                    <th>Status</th>
                    <th>Cost Price</th>
                    <th>Stock Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.barcode}</td>
                      <td className="product-name">{item.name}</td>
                      <td>{item.category}</td>
                      <td className="stock-qty">{item.current_stock}</td>
                      <td>{item.minimum_stock}</td>
                      <td>{getStockStatusBadge(item.stock_status)}</td>
                      <td>${item.cost_price.toFixed(2)}</td>
                      <td>${item.stock_value.toFixed(2)}</td>
                      <td className="actions">
                        <button
                          className="btn-action btn-adjust"
                          onClick={() => handleAdjustStock(item)}
                          title="Adjust Stock"
                        >
                          📝
                        </button>
                        <button
                          className="btn-action btn-reorder"
                          onClick={() => handleSetReorderPoint(item)}
                          title="Set Reorder Point"
                        >
                          ⚙️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alerts-section">
              {lowStockAlerts.alerts.length === 0 ? (
                <div className="no-alerts">
                  <div className="no-alerts-icon">✅</div>
                  <h3>No Low Stock Alerts</h3>
                  <p>All products are well stocked!</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {lowStockAlerts.alerts.map((alert) => (
                    <div key={alert.id} className={`alert-card alert-${alert.alert_level}`}>
                      <div className="alert-header">
                        <div className="alert-icon">
                          {alert.alert_level === 'critical' ? '🚨' : '⚠️'}
                        </div>
                        <div className="alert-info">
                          <h4>{alert.name}</h4>
                          <p className="alert-barcode">{alert.barcode}</p>
                        </div>
                        <div className="alert-badge">
                          {alert.alert_level === 'critical' ? 'CRITICAL' : 'WARNING'}
                        </div>
                      </div>
                      <div className="alert-details">
                        <div className="detail-item">
                          <span className="detail-label">Current Stock:</span>
                          <span className="detail-value">{alert.current_stock}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Minimum Stock:</span>
                          <span className="detail-value">{alert.minimum_stock}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Suggested Reorder:</span>
                          <span className="detail-value bold">{alert.reorder_quantity} units</span>
                        </div>
                      </div>
                      <div className="alert-actions">
                        <button
                          className="btn-primary"
                          onClick={() => handleAdjustStock(alert)}
                        >
                          Restock Now
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => handleSetReorderPoint(alert)}
                        >
                          Adjust Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAdjustmentModal && (
        <StockAdjustmentModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}
      {showReorderModal && (
        <ReorderPointModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default StockManagementPage;
