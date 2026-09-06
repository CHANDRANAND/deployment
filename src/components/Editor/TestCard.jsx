import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  isAbnormalResult,
  isCriticalResult,
  extractGenderRangeSegment
} from '../../utils/clinicalCalculations.js';
import { testStyleToCss, getTestStyle } from '../../utils/formatters.js';

export function TestCard({ component }) {
  const { activeSheet, updateTestValue, toggleSection, moveSection, moveSubtest } = useApp();
  const gender = activeSheet?.patient?.gender || 'M';

  if (!component) return null;

  return (
    <div className="card test-group-card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h3 style={{ margin: 0 }}>{component.name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {component.tests?.length || 0} active parameters
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button className="ghost-btn" type="button" onClick={() => moveSection(component.id, -1)} disabled={activeSheet.tests[0]?.id === component.id} title="Move test group up" aria-label="Move test group up">↑</button>
        <button className="ghost-btn" type="button" onClick={() => moveSection(component.id, 1)} disabled={activeSheet.tests[activeSheet.tests.length - 1]?.id === component.id} title="Move test group down" aria-label="Move test group down">↓</button>
        <button
          className="ghost-btn"
          style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
          onClick={() => toggleSection(component)}
          title="Remove this test group from current report"
        >
          Remove Group
        </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Investigation / Test</th>
              <th style={{ width: '25%' }}>Observed Value</th>
              <th style={{ width: '15%' }}>Unit</th>
              <th style={{ width: '25%' }}>Biological Ref. Range</th>
            </tr>
          </thead>
          <tbody>
            {component.tests?.map((test) => {
              const abnormal = isAbnormalResult(test, gender);
              const critical = isCriticalResult(test, gender);
              const genderRange = extractGenderRangeSegment(test.referenceRange, gender);
              const style = getTestStyle(test.style);
              const nameCss = testStyleToCss(test.style);

              return (
                <tr
                  key={test.id}
                  className={`test-row ${critical ? 'is-critical' : abnormal ? 'is-abnormal' : ''}`}
                  style={style.isHeading ? { borderTop: '2px solid var(--border)' } : undefined}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ ...nameCss, fontWeight: (abnormal || critical) ? '700' : nameCss.fontWeight }}>
                        {test.name}
                      </span>
                      {test.formula && (
                        <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }} title={`Formula: ${test.formula}`}>
                          Auto (fx)
                        </span>
                      )}
                      {critical && (
                        <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
                          CRITICAL
                        </span>
                      )}
                      {!critical && abnormal && (
                        <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#fff8e6', color: '#b7791f' }}>
                          ABNORMAL
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', gap: '2px', marginLeft: 'auto' }}>
                        <button className="ghost-btn" type="button" onClick={() => moveSubtest(component.id, test.id, -1)} disabled={component.tests[0]?.id === test.id} title="Move subtest up" aria-label="Move subtest up">↑</button>
                        <button className="ghost-btn" type="button" onClick={() => moveSubtest(component.id, test.id, 1)} disabled={component.tests[component.tests.length - 1]?.id === test.id} title="Move subtest down" aria-label="Move subtest down">↓</button>
                      </span>
                    </div>
                  </td>
                  <td>
                    {Array.isArray(test.options) && test.options.length > 0 ? (
                      <select
                        value={test.value || ''}
                        onChange={(e) => updateTestValue(component.id, test.id, e.target.value)}
                        className={`test-input ${abnormal ? 'text-abnormal' : ''}`}
                      >
                        <option value="">-- Select --</option>
                        {test.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={test.value || ''}
                        onChange={(e) => updateTestValue(component.id, test.id, e.target.value)}
                        placeholder={test.formula ? 'Calculated' : 'Enter result'}
                        readOnly={Boolean(test.formula)}
                        className={`test-input ${abnormal ? 'text-abnormal' : ''}`}
                        style={{
                          backgroundColor: test.formula ? 'var(--panel-strong)' : undefined,
                          fontWeight: abnormal || critical ? '700' : 'normal'
                        }}
                      />
                    )}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{test.unit || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                    {genderRange || test.referenceRange || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
