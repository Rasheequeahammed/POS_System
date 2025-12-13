import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAnalyticsDashboard,
  setDateRange,
  clearError,
} from '../redux/slices/analyticsSlice';
import SalesTrendsChart from '../components/SalesTrendsChart';
import ProfitAnalysisChart from '../components/ProfitAnalysisChart';
import TopProductsTable from '../components/TopProductsTable';
import CustomerInsights from '../components/CustomerInsights';
import CategoryRevenueChart from '../components/CategoryRevenueChart';
import '../styles/AnalyticsPage.css';

function AnalyticsPage() {
  const dispatch = useDispatch();
  const {
    salesTrends,
    profitAnalysis,
    topProducts,
    customerInsights,
    revenueByCategory,
    loading,
    error,
  } = useSelector((state) => state.analytics);

  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [quickFilter, setQuickFilter] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    dispatch(
      fetchAnalyticsDashboard({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })
    );
    dispatch(setDateRange(dateFilter));
  };

  const handleQuickFilter = (filter) => {
    setQuickFilter(filter);
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'thisMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate.setDate(0); // Last day of previous month
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    setDateFilter({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  const handleCustomDateChange = (field, value) => {
    setDateFilter({
      ...dateFilter,
      [field]: value,
    });
    setQuickFilter('custom');
  };

  const handleApplyFilter = () => {
    loadAnalytics();
  };

  const handleExportData = () => {
    // Prepare analytics data for export
    const exportData = {
      date_range: dateFilter,
      sales_trends: salesTrends,
      profit_analysis: profitAnalysis,
      top_products: topProducts,
      customer_insights: customerInsights,
      revenue_by_category: revenueByCategory,
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${dateFilter.startDate}_to_${dateFilter.endDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-content">
          <h1>📊 Advanced Analytics</h1>
          <p>Comprehensive insights into your business performance</p>
        </div>
        <button className="export-btn" onClick={handleExportData}>
          📥 Export Data
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())}>✕</button>
        </div>
      )}

      <div className="filters-container">
        <div className="quick-filters">
          <button
            className={`filter-btn ${quickFilter === '7days' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('7days')}
          >
            Last 7 Days
          </button>
          <button
            className={`filter-btn ${quickFilter === '30days' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('30days')}
          >
            Last 30 Days
          </button>
          <button
            className={`filter-btn ${quickFilter === '90days' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('90days')}
          >
            Last 90 Days
          </button>
          <button
            className={`filter-btn ${quickFilter === 'thisMonth' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('thisMonth')}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${quickFilter === 'lastMonth' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('lastMonth')}
          >
            Last Month
          </button>
          <button
            className={`filter-btn ${quickFilter === '1year' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('1year')}
          >
            Last Year
          </button>
        </div>

        <div className="custom-date-filter">
          <div className="date-input-group">
            <label>From:</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              max={dateFilter.endDate}
            />
          </div>
          <div className="date-input-group">
            <label>To:</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              min={dateFilter.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button className="apply-btn" onClick={handleApplyFilter} disabled={loading}>
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <div className="analytics-content">
          <div className="charts-row">
            <div className="chart-col-full">
              <SalesTrendsChart
                data={salesTrends.data}
                comparison={salesTrends.comparison}
                growth={salesTrends.growth}
              />
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-col-half">
              <ProfitAnalysisChart profitAnalysis={profitAnalysis} />
            </div>
            <div className="chart-col-half">
              <CategoryRevenueChart revenueByCategory={revenueByCategory} />
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-col-full">
              <TopProductsTable topProducts={topProducts} />
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-col-full">
              <CustomerInsights customerInsights={customerInsights} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
