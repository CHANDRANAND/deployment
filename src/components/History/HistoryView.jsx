import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { formatSavedAt } from '../../utils/formatters.js';

export function HistoryView() {
  const { history, restoreHistoryItem, duplicateHistoryItem, deleteHistoryItem, setPreviewReport } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const nameMatch = (item.patient?.name || '').toLowerCase().includes(q);
    const doctorMatch = (item.patient?.doctor || '').toLowerCase().includes(q);
    const dateMatch = (item.savedAt || '').toLowerCase().includes(q);
    return nameMatch || doctorMatch || dateMatch;
  });

  return (
    <div className="view-container history-view">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Report History & Archives</h2>
          <p className="muted-text">Search, restore, or reprint previously finalized laboratory reports.</p>
        </div>
        <div style={{ width: '320px' }}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient, doctor, or date..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="empty-state card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="muted-text">No saved reports found.</p>
        </div>
      ) : (
        <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredHistory.map((item) => {
            const testCount = item.tests?.reduce((sum, c) => sum + (c.tests?.length || 0), 0) || 0;
            return (
              <div key={item.historyId} className="card history-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>
                      {item.patient?.name || 'Unnamed Patient'}
                    </h3>
                    <span className="badge" style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      {item.patient?.gender || 'M'} / {item.patient?.age || '—'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div><strong>Doctor:</strong> {item.patient?.doctor || '—'}</div>
                    <div><strong>Saved At:</strong> {formatSavedAt(item.savedAt)}</div>
                    <div><strong>Tests:</strong> {item.tests?.length || 0} groups ({testCount} parameters)</div>
                  </div>
                </div>

                <div className="card-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <button
                    className="primary-btn"
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    onClick={() => restoreHistoryItem(item)}
                  >
                    Edit / Load
                  </button>
                  <button
                    className="secondary-btn"
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    onClick={() => setPreviewReport(item)}
                  >
                    Print
                  </button>
                  <button
                    className="ghost-btn"
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    onClick={() => duplicateHistoryItem(item)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="ghost-btn"
                    style={{ fontSize: '0.82rem', padding: '6px 12px', color: 'var(--danger)' }}
                    onClick={() => deleteHistoryItem(item.historyId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
