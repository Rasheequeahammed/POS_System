import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import '../styles/AnalyticsCharts.css';

function ProfitAnalysisChart({ profitAnalysis }) {
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>💰 Profit Analysis</h3>
      </div>

      <div className="profit-summary">
        <div className="profit-card">
          <div className="profit-icon">💵</div>
          <div className="profit-info">
            <span className="profit-label">Gross Profit</span>
            <span className="profit-value">{formatCurrency(profitAnalysis.gross_profit || 0)}</span>
          </div>
        </div>
        
        <div className="profit-card">
          <div className="profit-icon">💎</div>
          <div className="profit-info">
            <span className="profit-label">Net Profit</span>
            <span className="profit-value">{formatCurrency(profitAnalysis.net_profit || 0)}</span>
          </div>
        </div>
        
        <div className="profit-card">
          <div className="profit-icon">📊</div>
          <div className="profit-info">
            <span className="profit-label">Profit Margin</span>
            <span className="profit-value">{(profitAnalysis.profit_margin || 0).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {profitAnalysis.by_category && profitAnalysis.by_category.length > 0 && (
        <div className="profit-chart-section">
          <h4>Profit by Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitAnalysis.by_category}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="profit" name="Profit" radius={[8, 8, 0, 0]}>
                {profitAnalysis.by_category.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {profitAnalysis.by_product && profitAnalysis.by_product.length > 0 && (
        <div className="profit-table-section">
          <h4>Top Profitable Products</h4>
          <table className="profit-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {profitAnalysis.by_product.slice(0, 5).map((product, index) => (
                <tr key={index}>
                  <td>{product.product_name}</td>
                  <td>{formatCurrency(product.revenue)}</td>
                  <td>{formatCurrency(product.cost)}</td>
                  <td className="profit-value">{formatCurrency(product.profit)}</td>
                  <td>
                    <span className="margin-badge">{product.margin.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProfitAnalysisChart;
