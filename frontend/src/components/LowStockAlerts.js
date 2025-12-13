import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../styles/LowStockAlerts.css';

function LowStockAlerts() {
  const { lowStockProducts, loading } = useSelector((state) => state.dashboard);
  const navigate = useNavigate();

  const handleViewProducts = () => {
    navigate('/products');
  };

  return (
    <div className="low-stock-card">
      <div className="alert-header">
        <h2>⚠️ Low Stock Alerts</h2>
        <button onClick={handleViewProducts} className="view-all-btn">
          View All
        </button>
      </div>

      {loading ? (
        <div className="alert-loading">Loading alerts...</div>
      ) : lowStockProducts.length === 0 ? (
        <div className="alert-empty">
          <p>✅ All products are well stocked!</p>
        </div>
      ) : (
        <div className="alert-list">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="alert-item">
              <div className="alert-info">
                <span className="product-name">{product.name}</span>
                <span className="product-category">{product.category}</span>
              </div>
              <div className="stock-info">
                <span className="current-stock">{product.current_stock}</span>
                <span className="stock-label">/ {product.minimum_stock} min</span>
              </div>
            </div>
          ))}
          {lowStockProducts.length > 5 && (
            <div className="more-alerts">
              +{lowStockProducts.length - 5} more products need restocking
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LowStockAlerts;
