import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSettings } from '../redux/slices/settingsSlice';
import StoreInfoForm from '../components/StoreInfoForm';
import ReceiptSettingsForm from '../components/ReceiptSettingsForm';
import SystemSettingsForm from '../components/SystemSettingsForm';
import '../styles/SettingsPage.css';

function SettingsPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const tabs = [
    { id: 'store', label: 'Store Information', icon: '🏪' },
    { id: 'receipt', label: 'Receipt Settings', icon: '🧾' },
    { id: 'system', label: 'System Preferences', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return <StoreInfoForm />;
      case 'receipt':
        return <ReceiptSettingsForm />;
      case 'system':
        return <SystemSettingsForm />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your store, receipt, and system preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {loading ? (
            <div className="settings-loading">
              <div className="spinner"></div>
              <p>Loading settings...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
