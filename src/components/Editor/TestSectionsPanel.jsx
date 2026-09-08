import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export function TestSectionsPanel() {
  const { activeTemplate, activeSheet, toggleSection, toggleSubtest } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeTemplate || !activeSheet) return null;

  const activeSectionIds = new Set(activeSheet.tests.map((t) => t.id));

  const filteredSections = activeTemplate.sections.filter((sec) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesName = sec.name.toLowerCase().includes(query);
    const matchesSubtest = sec.tests.some((t) => t.name.toLowerCase().includes(query));
    return matchesName || matchesSubtest;
  });

  return (
    <div className="card test-sections-card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3>Test Catalog</h3>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tests..."
          style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
        />
      </div>

      <div className="sections-list" style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px' }}>
        {filteredSections.map((sec) => {
          const isSectionIncluded = activeSectionIds.has(sec.id);
          const activeComp = activeSheet.tests.find((t) => t.id === sec.id);
          const activeSubtestIds = new Set(activeComp?.tests?.map((t) => t.id) || []);

          return (
            <div
              key={sec.id}
              className={`section-selector-item ${isSectionIncluded ? 'included' : ''}`}
              style={{
                marginBottom: '10px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: isSectionIncluded ? 'var(--panel-strong)' : 'var(--panel)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={isSectionIncluded}
                    onChange={() => toggleSection(sec)}
                  />
                  {sec.name}
                </label>
                <span className="badge" style={{ fontSize: '0.75rem' }}>
                  {sec.tests.length} tests
                </span>
              </div>

              {isSectionIncluded && (
                <div style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sec.tests.map((subtest) => {
                    const isSubIncluded = activeSubtestIds.has(subtest.id);
                    return (
                      <label
                        key={subtest.id}
                        style={{
                          fontSize: '0.82rem',
                          color: isSubIncluded ? 'var(--text)' : 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSubIncluded}
                          onChange={() => toggleSubtest(sec.id, subtest)}
                        />
                        {subtest.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
