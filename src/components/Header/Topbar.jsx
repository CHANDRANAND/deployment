import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function Topbar() {
  const { currentView, setCurrentView, saveActiveSheetToHistory, setPreviewReport, activeSheet, settings } = useApp();
  const { currentUser, signOut } = useAuth();

  const navItems = [
    { id: 'editor', label: 'Report Editor' },
    { id: 'history', label: 'History' },
    { id: 'templates', label: 'Templates' },
    { id: 'settings', label: 'Settings' },
    { id: 'payments', label: 'Payments' }
  ];

  const handlePrint = () => {
    setPreviewReport(activeSheet);
  };

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark" style={settings.signatureImage ? {} : {}}>
          LR
        </div>
        <div>
          <h1>{settings.labName || 'Arun Clinical Lab'}</h1>
          <p>{settings.labTagline || 'Diagnostics & pathology reporting'}</p>
        </div>
      </div>

      <nav className="topnav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-pill ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {currentView === 'editor' && (
          <>
            <button className="ghost-btn" id="saveBtn" onClick={saveActiveSheetToHistory}>
              Save
            </button>
            <button className="secondary-btn" onClick={handlePrint}>
              Print preview
            </button>
          </>
        )}
        {currentUser && (
          <button
            className="ghost-btn"
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            onClick={signOut}
            title={`Signed in as ${currentUser.email}`}
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
