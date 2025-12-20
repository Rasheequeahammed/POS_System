import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchSalesChart } from '../redux/slices/dashboardSlice';
import { fetchTopProducts, fetchRevenueByCategory } from '../redux/slices/analyticsSlice';
import SalesChart from '../components/SalesChart';
import LowStockAlerts from '../components/LowStockAlerts';
import RecentSales from '../components/RecentSales';
import TopProductsTable from '../components/TopProductsTable';
import CategoryRevenueChart from '../components/CategoryRevenueChart';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { topProducts, revenueByCategory } = useSelector((state) => state.analytics);
  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchSalesChart('week'));
    
    // Fetch analytics data for last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    dispatch(fetchTopProducts({ startDate, endDate, limit: 10 }));
    dispatch(fetchRevenueByCategory({ startDate, endDate }));
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

      {/* Category Revenue & Top Products */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <CategoryRevenueChart revenueByCategory={revenueByCategory} />
        </div>

        <div className="dashboard-section">
          <TopProductsTable topProducts={topProducts} />
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
