import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
    category: cat.category,
    revenue: cat.revenue || 0,
    percentage: totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>📦 Revenue by Category</h3>
        <span className="header-badge">Total: {formatCurrency(totalRevenue)}</span>
      </div>

      <div className="category-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="category" 
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryRevenueChart;
