import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../styles/AnalyticsCharts.css';

function SalesTrendsChart({ data, comparison, growth }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>📈 Sales Trends</h3>
        {growth !== undefined && (
          <div className={`growth-badge ${growth >= 0 ? 'positive' : 'negative'}`}>
            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="chart-empty">
          <p>No sales data available for the selected period</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
                name="Transactions"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>

          {comparison && (
            <div className="comparison-stats">
              <div className="stat-item">
                <span className="stat-label">Current Period</span>
                <span className="stat-value">{formatCurrency(comparison.current)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Previous Period</span>
                <span className="stat-value">{formatCurrency(comparison.previous)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Difference</span>
                <span className={`stat-value ${comparison.difference >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(Math.abs(comparison.difference))}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SalesTrendsChart;
