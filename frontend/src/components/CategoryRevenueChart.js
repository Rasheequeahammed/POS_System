import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles/AnalyticsCharts.css';

function CategoryRevenueChart({ revenueByCategory }) {
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#F97316'];

  if (!revenueByCategory || revenueByCategory.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3>📦 Revenue by Category</h3>
        </div>
        <div className="chart-empty">
          <p>No category data available</p>
        </div>
      </div>
    );
  }

  const totalRevenue = revenueByCategory.reduce((sum, cat) => sum + (cat.revenue || 0), 0);

  const chartData = revenueByCategory.map((cat) => ({
    name: cat.category,
    value: cat.revenue || 0,
    percentage: totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0,
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>📦 Revenue by Category</h3>
        <span className="header-badge">Total: {formatCurrency(totalRevenue)}</span>
      </div>

      <div className="category-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-breakdown">
        {revenueByCategory.map((cat, index) => {
          const percentage = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="category-item">
              <div className="category-info">
                <div
                  className="category-color"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="category-name">{cat.category}</span>
              </div>
              <div className="category-stats">
                <span className="category-revenue">{formatCurrency(cat.revenue)}</span>
                <span className="category-percentage">{percentage}%</span>
              </div>
              <div className="category-bar-container">
                <div
                  className="category-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryRevenueChart;
