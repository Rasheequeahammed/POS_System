import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchSalesChart } from '../redux/slices/dashboardSlice';
import SalesChart from '../components/SalesChart';
import LowStockAlerts from '../components/LowStockAlerts';
import RecentSales from '../components/RecentSales';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchSalesChart('week'));
  }, [dispatch]);

  const handlePeriodChange = (period) => {
    setChartPeriod(period);
    dispatch(fetchSalesChart(period));
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p className="subtitle">Welcome back! Here's your business overview</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Today's Revenue</h3>
            <p className="card-value">₹{stats.todayRevenue.toFixed(2)}</p>
            <span className="card-label">Total sales today</span>
          </div>
        </div>

        <div className="overview-card sales">
          <div className="card-icon">🛒</div>
          <div className="card-content">
            <h3>Today's Sales</h3>
            <p className="card-value">{stats.todaySales}</p>
            <span className="card-label">Transactions completed</span>
          </div>
        </div>

        <div className="overview-card items">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Items Sold</h3>
            <p className="card-value">{stats.todayItems}</p>
            <span className="card-label">Products sold today</span>
          </div>
        </div>

        <div className="overview-card stock">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Low Stock</h3>
            <p className="card-value">{stats.lowStockCount}</p>
            <span className="card-label">Products need restocking</span>
          </div>
        </div>
      </div>

      {/* Sales Chart & Low Stock Alerts */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <SalesChart period={chartPeriod} onPeriodChange={handlePeriodChange} />
        </div>

        <div className="dashboard-section">
          <LowStockAlerts />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="dashboard-section full-width">
        <RecentSales />
      </div>
    </div>
  );
}

export default DashboardPage;
