import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  clearError,
} from '../redux/slices/suppliersSlice';
import SupplierForm from '../components/SupplierForm';
import SupplierDetailsModal from '../components/SupplierDetailsModal';
import '../styles/SuppliersPage.css';

function SuppliersPage() {
  const dispatch = useDispatch();
  const { items: suppliers, loading, error } = useSelector((state) => state.suppliers);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplierId, setViewingSupplierId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchSuppliers());
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

  const filteredSuppliers = suppliers.filter((supplier) => {
    const search = searchTerm.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(search) ||
      supplier.contact_person?.toLowerCase().includes(search) ||
      supplier.email?.toLowerCase().includes(search) ||
      supplier.phone?.includes(search)
    );
  });

  const handleAddNew = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const result = await dispatch(deleteSupplier(id));
      if (result.type === 'suppliers/deleteSupplier/fulfilled') {
        setSuccessMessage('Supplier deleted successfully!');
        dispatch(fetchSuppliers());
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    let result;
    if (editingSupplier) {
      result = await dispatch(updateSupplier({ id: editingSupplier.id, data: formData }));
      if (result.type === 'suppliers/updateSupplier/fulfilled') {
        setSuccessMessage('Supplier updated successfully!');
      }
    } else {
      result = await dispatch(createSupplier(formData));
      if (result.type === 'suppliers/createSupplier/fulfilled') {
        setSuccessMessage('Supplier created successfully!');
      }
    }
    setShowForm(false);
    setEditingSupplier(null);
    dispatch(fetchSuppliers());
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleViewDetails = (supplierId) => {
    setViewingSupplierId(supplierId);
  };

  return (
    <div className="suppliers-page">
      <div className="suppliers-header">
        <div>
          <h1>🏭 Supplier Management</h1>
          <p className="subtitle">Manage your supplier database and relationships</p>
        </div>
        {!showForm && (
          <button className="btn-add-supplier" onClick={handleAddNew}>
            + Add New Supplier
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {showForm ? (
        <div className="form-container">
          <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by name, contact person, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="supplier-count">
              {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">Loading suppliers...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="empty-state">
              <p>
                {searchTerm
                  ? 'No suppliers found matching your search'
                  : 'No suppliers yet. Add your first supplier!'}
              </p>
            </div>
          ) : (
            <div className="suppliers-table-container">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>GST Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="supplier-name">{supplier.name}</td>
                      <td>{supplier.contact_person}</td>
                      <td>{supplier.email || '-'}</td>
                      <td>{supplier.phone}</td>
                      <td className="gst-number">{supplier.gst_number || '-'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(supplier.id)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(supplier)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(supplier.id)}
                          title="Delete"
                        >
                          🗑️
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

      {viewingSupplierId && (
        <SupplierDetailsModal
          supplierId={viewingSupplierId}
          onClose={() => setViewingSupplierId(null)}
        />
      )}
    </div>
  );
}

export default SuppliersPage;
