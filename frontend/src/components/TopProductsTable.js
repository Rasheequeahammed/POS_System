import React from 'react';
import '../styles/AnalyticsCharts.css';

function TopProductsTable({ topProducts }) {
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3>🏆 Top Selling Products</h3>
        </div>
        <div className="chart-empty">
          <p>No product data available</p>
        </div>
      </div>
    );
  }

  const totalRevenue = topProducts.reduce((sum, product) => sum + (product.revenue || 0), 0);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>🏆 Top Selling Products</h3>
        <span className="header-badge">{topProducts.length} Products</span>
      </div>

      <div className="top-products-table-container">
        <table className="top-products-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.slice(0, 3).map((product, index) => {
              const contribution = totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;
              return (
                <tr key={index}>
                  <td>
                    <div className="rank-badge">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                  </td>
                  <td>
                    <div className="product-info">
                      <span className="product-name">{product.product_name}</span>
                      {product.barcode && (
                        <span className="product-barcode">{product.barcode}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="quantity-value">{product.quantity_sold || 0}</span>
                  </td>
                  <td>
                    <span className="revenue-value">{formatCurrency(product.revenue || 0)}</span>
                  </td>
                  <td>
                    <div className="contribution-cell">
                      <div className="contribution-bar-container">
                        <div
                          className="contribution-bar"
                          style={{ width: `${contribution}%` }}
                        />
                      </div>
                      <span className="contribution-text">{contribution.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="footer-stat">
          <span className="footer-label">Total Revenue:</span>
          <span className="footer-value">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Total Units Sold:</span>
          <span className="footer-value">
            {topProducts.reduce((sum, p) => sum + (p.quantity_sold || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopProductsTable;
