import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReceiptSettings, updateReceiptSettings, clearUpdateSuccess } from '../redux/slices/settingsSlice';
import '../styles/ReceiptSettingsForm.css';

function ReceiptSettingsForm() {
  const dispatch = useDispatch();
  const { receiptSettings, loading, error, updateSuccess } = useSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    show_logo: true,
    header_text: '',
    footer_text: 'Thank you for your business!',
    show_gst: true,
    show_barcode: true,
    terms_conditions: '',
  });

  useEffect(() => {
    if (receiptSettings) {
      setFormData({
        show_logo: receiptSettings.show_logo ?? true,
        header_text: receiptSettings.header_text || '',
        footer_text: receiptSettings.footer_text || 'Thank you for your business!',
        show_gst: receiptSettings.show_gst ?? true,
        show_barcode: receiptSettings.show_barcode ?? true,
        terms_conditions: receiptSettings.terms_conditions || '',
      });
    }
  }, [receiptSettings]);

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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateReceiptSettings(formData));
  };

  return (
    <form className="receipt-settings-form" onSubmit={handleSubmit}>
      <h3>Receipt Customization</h3>
      
      {error && <div className="error-message">{error}</div>}
      {updateSuccess && <div className="success-message">Receipt settings updated successfully!</div>}
      
      <div className="settings-section">
        <h4>Display Options</h4>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="show_logo"
              checked={formData.show_logo}
              onChange={handleChange}
            />
            <span>Show Store Logo on Receipt</span>
          </label>
        </div>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="show_gst"
              checked={formData.show_gst}
              onChange={handleChange}
            />
            <span>Show GST Details on Receipt</span>
          </label>
        </div>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="show_barcode"
              checked={formData.show_barcode}
              onChange={handleChange}
            />
            <span>Show Product Barcodes on Receipt</span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Receipt Text</h4>
        
        <div className="form-group">
          <label>Header Text</label>
          <textarea
            name="header_text"
            value={formData.header_text}
            onChange={handleChange}
            placeholder="Text to display at the top of the receipt (optional)"
            rows="2"
          />
          <small className="help-text">This text will appear below the store name</small>
        </div>
        
        <div className="form-group">
          <label>Footer Text</label>
          <textarea
            name="footer_text"
            value={formData.footer_text}
            onChange={handleChange}
            placeholder="Text to display at the bottom of the receipt"
            rows="2"
          />
          <small className="help-text">Common examples: "Thank you for your business!", "Visit again!"</small>
        </div>
        
        <div className="form-group">
          <label>Terms & Conditions</label>
          <textarea
            name="terms_conditions"
            value={formData.terms_conditions}
            onChange={handleChange}
            placeholder="Enter terms and conditions (optional)"
            rows="4"
          />
          <small className="help-text">E.g., return policy, warranty information, etc.</small>
        </div>
      </div>
      
      <div className="receipt-preview">
        <h4>Receipt Preview</h4>
        <div className="preview-container">
          <div className="preview-receipt">
            {formData.show_logo && <div className="preview-logo">[LOGO]</div>}
            <div className="preview-store-name">Benzy Duty Free Shop</div>
            {formData.header_text && <div className="preview-header">{formData.header_text}</div>}
            <div className="preview-divider">━━━━━━━━━━━━━━━━━━━━</div>
            <div className="preview-items">
              <div className="preview-item">Product Name × 1 ₹100.00</div>
              {formData.show_barcode && <div className="preview-barcode">Barcode: 1234567890</div>}
            </div>
            <div className="preview-divider">━━━━━━━━━━━━━━━━━━━━</div>
            <div className="preview-total">
              <div>Subtotal: ₹100.00</div>
              {formData.show_gst && <div>GST (18%): ₹18.00</div>}
              <div className="preview-grand-total">Total: ₹118.00</div>
            </div>
            {formData.terms_conditions && (
              <>
                <div className="preview-divider">━━━━━━━━━━━━━━━━━━━━</div>
                <div className="preview-terms">{formData.terms_conditions}</div>
              </>
            )}
            {formData.footer_text && (
              <div className="preview-footer">{formData.footer_text}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Receipt Settings'}
        </button>
      </div>
    </form>
  );
}

export default ReceiptSettingsForm;
