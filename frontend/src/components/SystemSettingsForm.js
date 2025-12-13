import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSystemSettings, updateSystemSettings, clearUpdateSuccess } from '../redux/slices/settingsSlice';
import '../styles/SystemSettingsForm.css';

function SystemSettingsForm() {
  const dispatch = useDispatch();
  const { systemSettings, loading, error, updateSuccess } = useSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    currency: 'INR',
    currency_symbol: '₹',
    date_format: 'DD/MM/YYYY',
    time_format: '12',
    low_stock_threshold: 10,
    default_gst_rate: 18,
    tax_inclusive: false,
  });

  useEffect(() => {
    if (systemSettings) {
      setFormData({
        currency: systemSettings.currency || 'INR',
        currency_symbol: systemSettings.currency_symbol || '₹',
        date_format: systemSettings.date_format || 'DD/MM/YYYY',
        time_format: systemSettings.time_format || '12',
        low_stock_threshold: systemSettings.low_stock_threshold || 10,
        default_gst_rate: systemSettings.default_gst_rate || 18,
        tax_inclusive: systemSettings.tax_inclusive ?? false,
      });
    }
  }, [systemSettings]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearUpdateSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;
    
    // Convert numeric fields to numbers
    if (name === 'low_stock_threshold' || name === 'default_gst_rate') {
      processedValue = parseFloat(value) || 0;
    }
    
    // Update currency symbol when currency changes
    if (name === 'currency') {
      const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
      };
      setFormData({
        ...formData,
        currency: value,
        currency_symbol: symbols[value] || value,
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateSystemSettings(formData));
  };

  return (
    <form className="system-settings-form" onSubmit={handleSubmit}>
      <h3>System Preferences</h3>
      
      {error && <div className="error-message">{error}</div>}
      {updateSuccess && <div className="success-message">System settings updated successfully!</div>}
      
      <div className="settings-section">
        <h4>Regional Settings</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Currency Symbol</label>
            <input
              type="text"
              name="currency_symbol"
              value={formData.currency_symbol}
              onChange={handleChange}
              placeholder="₹"
              maxLength="3"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Date Format</label>
            <select
              name="date_format"
              value={formData.date_format}
              onChange={handleChange}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Time Format</label>
            <select
              name="time_format"
              value={formData.time_format}
              onChange={handleChange}
            >
              <option value="12">12 Hour (AM/PM)</option>
              <option value="24">24 Hour</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Inventory Settings</h4>
        
        <div className="form-group">
          <label>Low Stock Alert Threshold</label>
          <input
            type="number"
            name="low_stock_threshold"
            value={formData.low_stock_threshold}
            onChange={handleChange}
            min="1"
            placeholder="10"
          />
          <small className="help-text">
            Alert will be shown when product stock falls below this quantity
          </small>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Tax Settings</h4>
        
        <div className="form-group">
          <label>Default GST Rate (%)</label>
          <input
            type="number"
            name="default_gst_rate"
            value={formData.default_gst_rate}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            placeholder="18"
          />
          <small className="help-text">
            Default tax rate to be applied to products (can be overridden per product)
          </small>
        </div>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="tax_inclusive"
              checked={formData.tax_inclusive}
              onChange={handleChange}
            />
            <span>Prices are Tax Inclusive</span>
          </label>
          <small className="help-text">
            If enabled, product prices include tax. If disabled, tax will be added on top of prices.
          </small>
        </div>
      </div>
      
      <div className="settings-info-box">
        <h4>📋 Current Configuration</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Currency:</span>
            <span className="info-value">{formData.currency} ({formData.currency_symbol})</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date Format:</span>
            <span className="info-value">{formData.date_format}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time Format:</span>
            <span className="info-value">{formData.time_format} Hour</span>
          </div>
          <div className="info-item">
            <span className="info-label">Low Stock Alert:</span>
            <span className="info-value">Below {formData.low_stock_threshold} units</span>
          </div>
          <div className="info-item">
            <span className="info-label">Default Tax:</span>
            <span className="info-value">{formData.default_gst_rate}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tax Type:</span>
            <span className="info-value">{formData.tax_inclusive ? 'Inclusive' : 'Exclusive'}</span>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save System Settings'}
        </button>
      </div>
    </form>
  );
}

export default SystemSettingsForm;
