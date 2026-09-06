import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { isCriticalResult } from '../../utils/clinicalCalculations.js';

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

  // WhatsApp can't be handed a PDF through a plain link — there's no way
  // for a website to attach a file to another app that way. This opens
  // WhatsApp with a text summary pre-filled instead, ready to send to
  // whoever is picked from the chat list; the actual PDF still needs to
  // be exported and attached by hand in that same chat.
  const handleWhatsAppSend = () => {
    if (!activeSheet) return;
    const patient = activeSheet.patient || {};
    const totalTests = activeSheet.tests?.reduce((sum, group) => sum + (group.tests?.length || 0), 0) || 0;
    const completed = activeSheet.tests?.reduce(
      (sum, group) => sum + (group.tests?.filter((t) => (t.value || '').trim() !== '').length || 0),
      0
    ) || 0;

    const criticalTests = [];
    activeSheet.tests?.forEach((group) => {
      group.tests?.forEach((test) => {
        if (isCriticalResult(test, patient.gender)) criticalTests.push(test);
      });
    });

    let message = `*${settings.labName || 'Arun Clinical Lab'} — Report Summary*\n\n`;
    message += `Patient: ${patient.name || 'Unnamed'}\n`;
    message += `Doctor: ${patient.doctor || '—'}\n`;
    message += `Date: ${patient.reportDate || '—'}\n`;
    message += `Tests: ${completed}/${totalTests} completed\n`;

    if (criticalTests.length) {
      message += `\n⚠️ Critical values:\n`;
      criticalTests.forEach((test) => {
        message += `- ${test.name}: ${test.value}\n`;
      });
    }

    message += `\nFull report to follow as a separate PDF attachment.`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    if (navigator.share) {
      navigator.share({ text: message, title: 'Lab Report Summary' }).catch(() => {
        window.open(waUrl, '_blank', 'noopener');
      });
    } else {
      window.open(waUrl, '_blank', 'noopener');
    }
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
            <button className="secondary-btn" onClick={handleWhatsAppSend}>
              Send via WhatsApp
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
