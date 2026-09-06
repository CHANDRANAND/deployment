import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export function PatientForm() {
  const { activeSheet, updateActiveSheetPatient, setActiveSheetDoctor, activeTemplate, templates } = useApp();

  if (!activeSheet) return null;
  const { patient } = activeSheet;

  // Combine doctor names across every template (default + all doctor-
  // specific ones), not just whichever template this sheet currently
  // happens to use — otherwise switching to a doctor-specific template
  // would hide every other doctor's name from the dropdown.
  const doctorOptions = Array.from(new Set(
    templates.flatMap((t) => t.doctors || []).concat(activeTemplate?.doctors || ['Dr. Self'])
  )).filter(Boolean);

  return (
    <div className="card patient-card">
      <div className="card-header">
        <h3>Patient & Sample Details</h3>
      </div>
      <div className="form-grid">
        <div className="field-group">
          <label>Patient Name *</label>
          <input
            type="text"
            value={patient.name || ''}
            onChange={(e) => updateActiveSheetPatient('name', e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
          />
        </div>

        <div className="field-row">
          <div className="field-group" style={{ flex: '1' }}>
            <label>Age *</label>
            <input
              type="text"
              value={patient.age || ''}
              onChange={(e) => updateActiveSheetPatient('age', e.target.value)}
              placeholder="e.g. 42 Y"
            />
          </div>

          <div className="field-group" style={{ flex: '1' }}>
            <label>Gender *</label>
            <div role="group" aria-label="Gender" style={{ display: 'flex', gap: '6px' }}>
              {[
                ['M', 'Male'],
                ['F', 'Female'],
                ['O', 'Other']
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`gender-option ${patient.gender === value ? 'active' : ''}`}
                  onClick={() => updateActiveSheetPatient('gender', value)}
                  aria-pressed={patient.gender === value}
                  title={label}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-group">
          <label>Ref. Doctor</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={patient.doctor || ''}
              onChange={(e) => setActiveSheetDoctor(e.target.value)}
              placeholder="Dr. Name"
              list="doctorSuggestions"
            />
            <datalist id="doctorSuggestions">
              {doctorOptions.map((doc) => (
                <option key={doc} value={doc} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="field-row">
          <div className="field-group" style={{ flex: '1' }}>
            <label>Sample Date & Time</label>
            <input
              type="datetime-local"
              value={patient.sampleCollectedAt || ''}
              onChange={(e) => updateActiveSheetPatient('sampleCollectedAt', e.target.value)}
            />
          </div>

          <div className="field-group" style={{ flex: '1' }}>
            <label>Report Date</label>
            <input
              type="date"
              value={patient.reportDate || ''}
              onChange={(e) => updateActiveSheetPatient('reportDate', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
