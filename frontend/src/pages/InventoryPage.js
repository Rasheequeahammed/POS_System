import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchases, createPurchase, clearError } from '../redux/slices/purchasesSlice';
import { fetchProducts } from '../redux/slices/productsSlice';
import PurchaseForm from '../components/PurchaseForm';
import PurchaseDetailsModal from '../components/PurchaseDetailsModal';
import '../styles/InventoryPage.css';

function InventoryPage() {
  const dispatch = useDispatch();
  const { items: purchases, loading: purchasesLoading, error } = useSelector(
    (state) => state.purchases
  );
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);

  const [showForm, setShowForm] = useState(false);
  const [viewingPurchaseId, setViewingPurchaseId] = useState(null);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'purchases'
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchPurchases());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFormSubmit = async (formData) => {
    const result = await dispatch(createPurchase(formData));
    if (result.type === 'purchases/createPurchase/fulfilled') {
      setSuccessMessage('Purchase order created successfully!');
      setShowForm(false);
      dispatch(fetchPurchases());
      dispatch(fetchProducts());
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.barcode?.includes(search)
    );
  });

  const lowStockProducts = products.filter((p) => p.current_stock <= p.minimum_stock);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1>📦 Inventory & Purchase Management</h1>
          <p className="subtitle">Manage stock levels and record purchases</p>
        </div>
        {!showForm && (
          <button className="btn-add-purchase" onClick={() => setShowForm(true)}>
            + Record New Purchase
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {showForm ? (
        <div className="form-container">
          <h2>Record New Purchase</h2>
          <PurchaseForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <>
          <div className="inventory-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-label">Total Products</span>
                <span className="stat-value">{products.length}</span>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-value">{lowStockProducts.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <span className="stat-label">Total Purchases</span>
                <span className="stat-value">{purchases.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-label">Purchase Value</span>
                <span className="stat-value">
                  ₹
                  {purchases
                    .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              Current Stock
            </button>
            <button
              className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchase History
            </button>
          </div>

          {activeTab === 'stock' && (
            <>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="🔍 Search products by name, category, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {productsLoading ? (
                <div className="loading-state">Loading stock levels...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  {searchTerm ? 'No products found' : 'No products in inventory'}
                </div>
              ) : (
                <div className="table-container">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Barcode</th>
                        <th>Current Stock</th>
                        <th>Min Stock</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="product-name">{product.name}</td>
                          <td>{product.category}</td>
                          <td className="barcode">{product.barcode}</td>
                          <td>
                            <span
                              className={`stock-value ${
                                product.current_stock <= product.minimum_stock ? 'low' : ''
                              }`}
                            >
                              {product.current_stock}
                            </span>
                          </td>
                          <td>{product.minimum_stock}</td>
                          <td>₹{parseFloat(product.selling_price || product.price || 0).toFixed(2)}</td>
                          <td>
                            {product.current_stock <= product.minimum_stock ? (
                              <span className="status-badge low-stock">Low Stock</span>
                            ) : (
                              <span className="status-badge in-stock">In Stock</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'purchases' && (
            <>
              {purchasesLoading ? (
                <div className="loading-state">Loading purchase history...</div>
              ) : purchases.length === 0 ? (
                <div className="empty-state">No purchases recorded yet</div>
              ) : (
                <div className="table-container">
                  <table className="purchases-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>#{purchase.id}</td>
                          <td>
                            {new Date(purchase.purchase_date).toLocaleDateString('en-IN')}
                          </td>
                          <td>{purchase.supplier?.name || 'N/A'}</td>
                          <td>{purchase.items?.length || 0} items</td>
                          <td className="amount">₹{parseFloat(purchase.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`payment-badge ${purchase.payment_status}`}>
                              {purchase.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-view"
                              onClick={() => setViewingPurchaseId(purchase.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewingPurchaseId && (
        <PurchaseDetailsModal
          purchaseId={viewingPurchaseId}
          onClose={() => setViewingPurchaseId(null)}
        />
      )}
    </div>
  );
}

export default InventoryPage;
