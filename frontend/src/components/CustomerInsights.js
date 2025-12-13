import React from 'react';
import '../styles/AnalyticsCharts.css';

function CustomerInsights({ customerInsights }) {
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const insights = [
    {
      icon: '👥',
      label: 'Total Customers',
      value: customerInsights.total_customers || 0,
      color: '#8B5CF6',
    },
    {
      icon: '🆕',
      label: 'New Customers',
      value: customerInsights.new_customers || 0,
      color: '#10B981',
    },
    {
      icon: '🔄',
      label: 'Returning Customers',
      value: customerInsights.returning_customers || 0,
      color: '#F59E0B',
    },
    {
      icon: '💳',
      label: 'Avg Purchase Value',
      value: formatCurrency(customerInsights.average_purchase_value || 0),
      color: '#EC4899',
    },
    {
      icon: '📊',
      label: 'Purchase Frequency',
      value: (customerInsights.purchase_frequency || 0).toFixed(1),
      color: '#3B82F6',
    },
    {
      icon: '💎',
      label: 'Customer Lifetime Value',
      value: formatCurrency(customerInsights.customer_lifetime_value || 0),
      color: '#8B5CF6',
    },
  ];

  const retentionRate =
    customerInsights.total_customers > 0
      ? ((customerInsights.returning_customers / customerInsights.total_customers) * 100).toFixed(1)
      : 0;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>👤 Customer Insights</h3>
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="insight-card"
            style={{ borderLeftColor: insight.color }}
          >
            <div className="insight-icon" style={{ color: insight.color }}>
              {insight.icon}
            </div>
            <div className="insight-content">
              <span className="insight-label">{insight.label}</span>
              <span className="insight-value">{insight.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="retention-section">
        <h4>Customer Retention</h4>
        <div className="retention-metric">
          <div className="retention-bar-container">
            <div
              className="retention-bar"
              style={{ width: `${retentionRate}%` }}
            >
              <span className="retention-percentage">{retentionRate}%</span>
            </div>
          </div>
          <p className="retention-description">
            {retentionRate >= 70
              ? 'Excellent retention rate! Your customers love coming back.'
              : retentionRate >= 50
              ? 'Good retention rate. Consider loyalty programs to improve.'
              : 'Focus on customer engagement to improve retention.'}
          </p>
        </div>
      </div>

      <div className="customer-stats-grid">
        <div className="stat-box">
          <span className="stat-title">Average Order Size</span>
          <span className="stat-number">
            {(customerInsights.purchase_frequency || 0).toFixed(1)} items
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Customer Growth</span>
          <span className="stat-number">
            {customerInsights.total_customers > 0
              ? ((customerInsights.new_customers / customerInsights.total_customers) * 100).toFixed(1)
              : 0}
            %
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Repeat Purchase Rate</span>
          <span className="stat-number">{retentionRate}%</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerInsights;
