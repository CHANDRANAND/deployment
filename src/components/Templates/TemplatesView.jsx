import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { createId } from '../../utils/formatters.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function TemplatesView() {
  const { templates, saveTemplate, deleteTemplate } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => templates[0]?.id || '');
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [doctorEditing, setDoctorEditing] = useState(false);
  const [doctorDraft, setDoctorDraft] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');

  const activeTmpl = templates.find((template) => template.id === selectedTemplateId) || templates[0];

  useEffect(() => {
    setDraft(activeTmpl ? clone(activeTmpl) : null);
    setEditing(false);
    setDoctorEditing(false);
    setDoctorDraft(clone(activeTmpl?.doctors || []));
  }, [selectedTemplateId, templates]);

  if (!draft) return null;

  const updateDraft = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const updateSection = (sectionId, changes) => updateDraft({
    sections: draft.sections.map((section) => section.id === sectionId ? { ...section, ...changes } : section)
  });
  const updateTest = (sectionId, testId, changes) => updateSection(sectionId, {
    tests: draft.sections.find((section) => section.id === sectionId).tests.map((test) => test.id === testId ? { ...test, ...changes } : test)
  });
  const saveDraft = () => {
    saveTemplate(clone(draft));
    setEditing(false);
  };
  const discardDraft = () => {
    setDraft(clone(activeTmpl));
    setEditing(false);
    setNewDoctorName('');
  };
  const saveDoctors = () => {
    const next = { ...clone(activeTmpl), doctors: doctorDraft.filter(Boolean) };
    saveTemplate(next);
    setDoctorEditing(false);
  };
  const discardDoctors = () => {
    setDoctorDraft(clone(activeTmpl.doctors || []));
    setDoctorEditing(false);
  };
  const createDoctorTemplate = () => {
    const name = doctorName.trim();
    if (!name) return;
    const next = { ...clone(draft), id: `doctor-${createId()}`, name: `${name} Template`, forDoctor: name, doctors: [name] };
    saveTemplate(next);
    setDoctorName('');
    setSelectedTemplateId(next.id);
  };
  const addDoctorName = () => {
    const name = newDoctorName.trim();
    if (!name) return;
    const doctors = Array.from(new Set([...doctorDraft, name]));
    setDoctorDraft(doctors);
    setDoctorEditing(true);
    setNewDoctorName('');
  };
  const updateDoctorName = (index, value) => {
    const doctors = [...doctorDraft];
    doctors[index] = value;
    setDoctorDraft(doctors);
  };
  const removeDoctorName = (index) => {
    setDoctorDraft(doctorDraft.filter((_, doctorIndex) => doctorIndex !== index));
  };
  const addSection = () => {
    const section = { id: createId(), name: 'New test group', tests: [] };
    updateDraft({ sections: [...draft.sections, section] });
  };
  const addTest = (sectionId) => {
    const section = draft.sections.find((item) => item.id === sectionId);
    updateSection(sectionId, { tests: [...section.tests, { id: createId(), name: 'New parameter', unit: '', referenceRange: '', options: [], abnormalOptions: [], criticalOptions: [], criticalLow: '', criticalHigh: '', formula: '' }] });
  };
  const removeTest = (sectionId, testId) => {
    const section = draft.sections.find((item) => item.id === sectionId);
    updateSection(sectionId, { tests: section.tests.filter((test) => test.id !== testId) });
  };

  return (
    <div className="view-container templates-view">
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <h2>Test Templates & Reference Range Builder</h2>
        <p className="muted-text">Manage test profiles, biological intervals, and automated formula parameters.</p>
      </div>

      <div className="templates-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        <div className="templates-sidebar card">
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Templates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {templates.map((template) => (
              <button key={template.id} className={`nav-pill ${template.id === draft.id ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }} type="button" onClick={() => setSelectedTemplateId(template.id)}>
                {template.forDoctor ? `${template.forDoctor} Template` : template.name}
              </button>
            ))}
          </div>
          <div className="doctor-template-panel">
          <div className="doctor-template-heading">
            <div>
              <h3>Doctors Templates</h3>
              <p>Create a doctor-specific copy or add a doctor to this template.</p>
            </div>
            <span className="doctor-template-mark">DR</span>
          </div>
          <label className="doctor-template-label">Create template for</label>
          <input className="doctor-template-input" value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="e.g. Dr. Sharma" />
          <button className="secondary-btn doctor-template-action" type="button" onClick={createDoctorTemplate}>Create from selected</button>
          </div>
          <div className="doctor-directory-panel">
            <div className="doctor-template-heading">
              <div>
                <h3>Doctors</h3>
                <p>Names available in the Ref. Doctor search.</p>
              </div>
              <span className="doctor-count">{doctorDraft.length}</span>
            </div>
            <label className="doctor-template-label">Add doctor</label>
            <input className="doctor-template-input" value={newDoctorName} onChange={(event) => setNewDoctorName(event.target.value)} placeholder="Search or add doctor" list="templateDoctorSuggestions" />
            <datalist id="templateDoctorSuggestions">
              {(draft.doctors || []).map((doctor) => <option key={doctor} value={doctor} />)}
            </datalist>
            <div className="doctor-directory-actions">
              {!doctorEditing ? <button className="ghost-btn doctor-template-action" type="button" onClick={() => setDoctorEditing(true)}>Edit doctors</button> : <>
                <button className="ghost-btn doctor-template-action" type="button" onClick={discardDoctors}>Discard</button>
                <button className="primary-btn doctor-template-action" type="button" onClick={saveDoctors}>Save doctors</button>
              </>}
              <button className="ghost-btn doctor-template-action" type="button" onClick={addDoctorName}>Add doctor</button>
            </div>
            <div className="doctor-template-list">
              {doctorDraft.length ? doctorDraft.map((doctor, index) => (
                <div className="doctor-template-row" key={`${doctor}-${index}`}>
                  {doctorEditing ? (
                    <input className="doctor-template-input" value={doctor} onChange={(event) => updateDoctorName(index, event.target.value)} />
                  ) : <span>{doctor}</span>}
                  {doctorEditing && <button className="doctor-template-remove" type="button" onClick={() => removeDoctorName(index)} aria-label={`Remove ${doctor}`} title={`Remove ${doctor}`}>×</button>}
                </div>
              )) : 'No doctors added'}
            </div>
            {!doctorEditing && <p className="doctor-directory-hint">Use Edit doctors to rename or remove doctors.</p>}
          </div>
        </div>

        <div className="template-details card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            {editing ? <input value={draft.name || ''} onChange={(event) => updateDraft({ name: event.target.value })} /> : <h3 style={{ margin: 0 }}>{draft.name}</h3>}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>{draft.sections?.length || 0} Test Groups</span>
              {editing ? <>
                <button className="ghost-btn" type="button" onClick={discardDraft}>Discard</button>
                <button className="primary-btn" type="button" onClick={saveDraft}>Save</button>
              </> : <button className="ghost-btn" type="button" onClick={() => setEditing(true)}>Edit</button>}
            </div>
          </div>

          {editing && (
            <div className="field-group" style={{ marginBottom: '16px' }}>
              <label>Assigned doctor</label>
              <input value={draft.forDoctor || ''} placeholder="Default template" onChange={(event) => updateDraft({ forDoctor: event.target.value || null, doctors: event.target.value ? [event.target.value] : draft.doctors })} />
            </div>
          )}

          <div className="sections-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {draft.sections?.map((section) => (
              <div key={section.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  {editing ? <input value={section.name} onChange={(event) => updateSection(section.id, { name: event.target.value })} /> : <h4 style={{ margin: 0, color: 'var(--primary-strong)' }}>{section.name}</h4>}
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{section.tests?.length || 0} Subtests</span>
                </div>

                {editing && <div className="template-group-style-controls">
                  <select value={section.headingType || 'normal'} onChange={(event) => updateSection(section.id, { headingType: event.target.value })}>
                    <option value="test">Test group name</option>
                    <option value="normal">Normal heading</option>
                  </select>
                  <input type="number" min="8" max="48" placeholder="Heading size" value={section.headingStyle?.fontSize || 15} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, fontSize: Number(event.target.value) || 15 } })} />
                  <select value={section.headingStyle?.fontFamily || ''} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, fontFamily: event.target.value } })}>
                    <option value="">Heading font</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times New Roman</option><option value="Verdana">Verdana</option>
                  </select>
                  <select value={section.headingStyle?.alignment || 'left'} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, alignment: event.target.value } })}>
                    <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                  </select>
                  <label><input type="checkbox" checked={Boolean(section.headingStyle?.bold)} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, bold: event.target.checked } })} /> Bold</label>
                  <label><input type="checkbox" checked={Boolean(section.headingStyle?.italic)} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, italic: event.target.checked } })} /> Italic</label>
                  <label><input type="checkbox" checked={Boolean(section.headingStyle?.underline)} onChange={(event) => updateSection(section.id, { headingStyle: { ...section.headingStyle, underline: event.target.checked } })} /> Underline</label>
                  <input className="template-group-subheading" placeholder="Optional subheading under this group" value={section.subheading || ''} onChange={(event) => updateSection(section.id, { subheading: event.target.value })} />
                  <input type="number" min="8" max="36" placeholder="Subheading size" value={section.subheadingStyle?.fontSize || 12} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, fontSize: Number(event.target.value) || 12 } })} />
                  <select value={section.subheadingStyle?.fontFamily || ''} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, fontFamily: event.target.value } })}>
                    <option value="">Subheading font</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times New Roman</option><option value="Verdana">Verdana</option>
                  </select>
                  <select value={section.subheadingStyle?.alignment || 'left'} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, alignment: event.target.value } })}>
                    <option value="left">Subheading left</option><option value="center">Subheading center</option><option value="right">Subheading right</option>
                  </select>
                  <label><input type="checkbox" checked={Boolean(section.subheadingStyle?.bold)} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, bold: event.target.checked } })} /> Subheading bold</label>
                  <label><input type="checkbox" checked={Boolean(section.subheadingStyle?.italic)} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, italic: event.target.checked } })} /> Subheading italic</label>
                  <label><input type="checkbox" checked={Boolean(section.subheadingStyle?.underline)} onChange={(event) => updateSection(section.id, { subheadingStyle: { ...section.subheadingStyle, underline: event.target.checked } })} /> Subheading underline</label>
                </div>}

                <div className="table-responsive">
                  <table className="test-table" style={{ fontSize: '0.85rem' }}>
                    <thead><tr><th>Parameter</th><th>Unit</th><th>Reference Interval</th><th>Critical Limits / Formula</th>{editing && <th aria-label="Actions" />}</tr></thead>
                    <tbody>
                      {section.tests?.map((test) => (
                        <tr key={test.id}>
                          <td>{editing ? <input value={test.name || ''} onChange={(event) => updateTest(section.id, test.id, { name: event.target.value })} /> : <strong>{test.name}</strong>}</td>
                          <td>{editing ? <input value={test.unit || ''} onChange={(event) => updateTest(section.id, test.id, { unit: event.target.value })} /> : (test.unit || '—')}</td>
                          <td>{editing ? <textarea rows="2" value={test.referenceRange || ''} onChange={(event) => updateTest(section.id, test.id, { referenceRange: event.target.value })} /> : (test.referenceRange || '—')}</td>
                          <td>
                            {editing ? <>
                              <input placeholder="Formula" value={test.formula || ''} onChange={(event) => updateTest(section.id, test.id, { formula: event.target.value })} />
                              <input placeholder="Critical low" value={test.criticalLow || ''} onChange={(event) => updateTest(section.id, test.id, { criticalLow: event.target.value })} />
                              <input placeholder="Critical high" value={test.criticalHigh || ''} onChange={(event) => updateTest(section.id, test.id, { criticalHigh: event.target.value })} />
                              <input placeholder="Options, comma separated" value={(test.options || []).join(', ')} onChange={(event) => updateTest(section.id, test.id, { options: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                            </> : <>
                              {test.formula && <span className="badge">Formula: {test.formula}</span>}
                              {test.criticalLow && <span className="badge" style={{ color: 'var(--danger)' }}>Min: {test.criticalLow}</span>}
                              {test.criticalHigh && <span className="badge" style={{ color: 'var(--danger)' }}>Max: {test.criticalHigh}</span>}
                              {!test.formula && !test.criticalLow && !test.criticalHigh && '—'}
                            </>}
                          </td>
                          {editing && <td><button className="doctor-template-remove" type="button" onClick={() => removeTest(section.id, test.id)} aria-label={`Remove ${test.name || 'parameter'}`} title="Remove parameter">×</button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {editing && <button className="secondary-btn" type="button" onClick={() => addTest(section.id)}>+ Add parameter</button>}
              </div>
            ))}
          </div>

          {editing && <button className="secondary-btn" type="button" onClick={addSection}>+ Add test group</button>}
          {editing && draft.forDoctor && <button className="ghost-btn" type="button" style={{ marginLeft: '8px' }} onClick={() => deleteTemplate(draft.id)}>Delete doctor template</button>}
        </div>
      </div>
    </div>
  );
}
