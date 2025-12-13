import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  clearError,
} from '../redux/slices/customersSlice';
import CustomerForm from '../components/CustomerForm';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import '../styles/CustomersPage.css';

function CustomersPage() {
  const dispatch = useDispatch();
  const { items: customers, loading, error } = useSelector((state) => state.customers);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomerId, setViewingCustomerId] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search)
    );
  });

  const handleAddNew = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await dispatch(deleteCustomer(id));
      dispatch(fetchCustomers());
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingCustomer) {
      await dispatch(updateCustomer({ id: editingCustomer.id, data: formData }));
    } else {
      await dispatch(createCustomer(formData));
    }
    setShowForm(false);
    setEditingCustomer(null);
    dispatch(fetchCustomers());
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleViewDetails = (customerId) => {
    setViewingCustomerId(customerId);
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h1>👥 Customer Management</h1>
          <p className="subtitle">Manage your customer database</p>
        </div>
        {!showForm && (
          <button className="btn-add-customer" onClick={handleAddNew}>
            + Add New Customer
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm ? (
        <div className="form-container">
          <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="customer-count">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p>
                {searchTerm
                  ? 'No customers found matching your search'
                  : 'No customers yet. Add your first customer!'}
              </p>
            </div>
          ) : (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="customer-name">{customer.name}</td>
                      <td>{customer.email || '-'}</td>
                      <td>{customer.phone}</td>
                      <td className="address-cell">
                        {customer.address ? (
                          <span title={customer.address}>
                            {customer.address.length > 30
                              ? customer.address.substring(0, 30) + '...'
                              : customer.address}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(customer.id)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(customer)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(customer.id)}
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

      {viewingCustomerId && (
        <CustomerDetailsModal
          customerId={viewingCustomerId}
          onClose={() => setViewingCustomerId(null)}
        />
      )}
    </div>
  );
}

export default CustomersPage;
