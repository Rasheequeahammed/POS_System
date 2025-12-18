import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../redux/slices/productsSlice';
import ProductForm from '../components/ProductForm';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
      dispatch(fetchProducts());
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    dispatch(fetchProducts());
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Product Management</h1>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          + Add New Product
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, barcode, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Name</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>MRP</th>
              <th>Stock</th>
              <th>GST %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No products found. Click "Add New Product" to get started.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.barcode}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{parseFloat(product.cost_price || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(product.selling_price || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(product.mrp || 0).toFixed(2)}</td>
                  <td className={product.current_stock <= product.minimum_stock ? 'low-stock' : ''}>
                    {product.current_stock}
                    {product.current_stock <= product.minimum_stock && ' ⚠️'}
                  </td>
                  <td>{product.gst_rate}%</td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(product)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ProductsPage;
