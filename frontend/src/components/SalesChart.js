import React from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/SalesChart.css';

function SalesChart({ period, onPeriodChange }) {
  const { chartData, loading } = useSelector((state) => state.dashboard);

  // Convert chartData object to array for recharts
  const data = Object.entries(chartData).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: date,
    revenue: parseFloat(amount).toFixed(2),
  })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  return (
    <div className="sales-chart-card">
      <div className="chart-header">
        <h2>📈 Sales Trend</h2>
        <div className="period-buttons">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => onPeriodChange('week')}
          >
            Week
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => onPeriodChange('month')}
          >
            Month
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => onPeriodChange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="chart-loading">Loading chart...</div>
      ) : data.length === 0 ? (
        <div className="chart-empty">No sales data available for this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`₹${value}`, 'Revenue']}
              labelStyle={{ color: '#333' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: '#4F46E5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SalesChart;
