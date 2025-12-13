import React from 'react';
import '../styles/SalesStats.css';

const SalesStats = ({ stats }) => {
  return (
    <div className="sales-stats">
      <div className="stat-card revenue">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="stat-card sales">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
      </div>

      <div className="stat-card average">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>Average Sale</h3>
          <p className="stat-value">₹{stats.averageSale.toFixed(2)}</p>
        </div>
      </div>

      <div className="stat-card items">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <h3>Items Sold</h3>
          <p className="stat-value">{stats.itemsSold}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesStats;
