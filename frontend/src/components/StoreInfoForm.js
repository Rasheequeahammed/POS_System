import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStoreInfo, updateStoreInfo, uploadStoreLogo, clearUpdateSuccess } from '../redux/slices/settingsSlice';
import '../styles/StoreInfoForm.css';

function StoreInfoForm() {
  const dispatch = useDispatch();
  const { storeInfo, loading, error, updateSuccess } = useSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    business_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gst_number: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (storeInfo) {
      setFormData({
        business_name: storeInfo.business_name || '',
        address: storeInfo.address || '',
        city: storeInfo.city || '',
        state: storeInfo.state || '',
        pincode: storeInfo.pincode || '',
        phone: storeInfo.phone || '',
        email: storeInfo.email || '',
        gst_number: storeInfo.gst_number || '',
      });
      setLogoPreview(storeInfo.logo_url);
    }
  }, [storeInfo]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearUpdateSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors({ ...validationErrors, logo: 'Please select an image file' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors({ ...validationErrors, logo: 'File size must be less than 5MB' });
        return;
      }
      
      setLogoFile(file);
      setValidationErrors({ ...validationErrors, logo: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number)) {
      errors.gst_number = 'Invalid GST number format';
    }
    
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Upload logo first if changed
    if (logoFile) {
      const logoFormData = new FormData();
      logoFormData.append('logo', logoFile);
      await dispatch(uploadStoreLogo(logoFormData));
    }
    
    // Update store info
    await dispatch(updateStoreInfo(formData));
  };

  return (
    <form className="store-info-form" onSubmit={handleSubmit}>
      <h3>Store Information</h3>
      
      {error && <div className="error-message">{error}</div>}
      {updateSuccess && <div className="success-message">Settings updated successfully!</div>}
      
      <div className="logo-upload-section">
        <label>Store Logo</label>
        <div className="logo-preview-container">
          {logoPreview && (
            <img src={logoPreview} alt="Store Logo" className="logo-preview" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="logo-input"
          />
          {validationErrors.logo && <span className="error">{validationErrors.logo}</span>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Business Name *</label>
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            placeholder="Enter business name"
          />
          {validationErrors.business_name && (
            <span className="error">{validationErrors.business_name}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
          {validationErrors.phone && <span className="error">{validationErrors.phone}</span>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {validationErrors.email && <span className="error">{validationErrors.email}</span>}
        </div>
        
        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            placeholder="22AAAAA0000A1Z5"
          />
          {validationErrors.gst_number && (
            <span className="error">{validationErrors.gst_number}</span>
          )}
        </div>
      </div>
      
      <div className="form-group full-width">
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter street address"
          rows="2"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
          />
        </div>
        
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
          />
        </div>
        
        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
          {validationErrors.pincode && <span className="error">{validationErrors.pincode}</span>}
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Store Information'}
        </button>
      </div>
    </form>
  );
}

export default StoreInfoForm;
