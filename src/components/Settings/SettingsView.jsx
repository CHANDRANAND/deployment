import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function SettingsView() {
  const { settings, setSettings, showToast } = useApp();
  const { saveMpin } = useAuth();
  const [newMpin, setNewMpin] = useState('');

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({ ...prev, signatureImage: reader.result }));
      showToast('Digital signature uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMpin = async (e) => {
    e.preventDefault();
    if (newMpin.length < 4 || newMpin.length > 6) {
      showToast('MPIN must be 4 to 6 digits');
      return;
    }
    await saveMpin(newMpin);
    setNewMpin('');
    showToast('MPIN successfully updated');
  };

  return (
    <div className="view-container settings-view">
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <h2>Laboratory & System Settings</h2>
        <p className="muted-text">Customize lab branding, letterhead spacing, digital signatures, and security credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Lab Branding */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Lab Details & Letterhead</h3>
          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field-group">
              <label>Laboratory Name</label>
              <input
                type="text"
                value={settings.labName || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, labName: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label>Tagline / Subtitle</label>
              <input
                type="text"
                value={settings.labTagline || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, labTagline: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label>Address</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="field-row" style={{ display: 'flex', gap: '12px' }}>
              <div className="field-group" style={{ flex: '1' }}>
                <label>Phone Number</label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="field-group" style={{ flex: '1' }}>
                <label>Email</label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Print Layout & Margins */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Print Spacing & Layout</h3>
          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field-group">
              <label>Pre-printed Header Spacing (px)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={settings.letterheadSpacing || 0}
                onChange={(e) => setSettings((prev) => ({ ...prev, letterheadSpacing: parseInt(e.target.value, 10) || 0 }))}
              />
              <small className="muted-text">Increase if printing on pre-printed laboratory stationery.</small>
            </div>

            <div className="field-group">
              <label>Pre-printed Footer Spacing (px)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={settings.footerSpacing || 0}
                onChange={(e) => setSettings((prev) => ({ ...prev, footerSpacing: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>

            <div className="field-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(settings.metaBoxed)}
                  onChange={(e) => setSettings((prev) => ({ ...prev, metaBoxed: e.target.checked }))}
                />
                Use Boxed Patient Metadata Grid in Print
              </label>
            </div>

            <div className="field-group" style={{ marginTop: '8px' }}>
              <label>Pathologist / Lab In-Charge Digital Signature</label>
              <input type="file" accept="image/*" onChange={handleSignatureUpload} />
              {settings.signatureImage && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={settings.signatureImage} alt="Signature" style={{ maxHeight: '50px', border: '1px solid var(--border)' }} />
                  <button
                    className="ghost-btn"
                    style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                    onClick={() => setSettings((prev) => ({ ...prev, signatureImage: '' }))}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Security & Quick Unlock</h3>
          <form onSubmit={handleUpdateMpin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field-group">
              <label>Update MPIN (4-6 digits)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                maxLength={6}
                value={newMpin}
                onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter new MPIN"
                required
              />
            </div>
            <button className="primary-btn" type="submit" style={{ width: 'fit-content' }}>
              Update MPIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
