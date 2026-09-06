import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { createId, getTestStyle, resolveFontSizePx, WORD_FONTS, getPrintSettings } from '../../utils/formatters.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function TemplatesView() {
  const { templates, saveTemplate, deleteTemplate } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => templates[0]?.id || '');
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');

  const activeTmpl = templates.find((template) => template.id === selectedTemplateId) || templates[0];

  useEffect(() => {
    setDraft(activeTmpl ? clone(activeTmpl) : null);
    setEditing(false);
  }, [selectedTemplateId, templates]);

  if (!draft) return null;

  const updateDraft = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const updateSection = (sectionId, changes) => updateDraft({
    sections: draft.sections.map((section) => section.id === sectionId ? { ...section, ...changes } : section)
  });
  const updateTest = (sectionId, testId, changes) => updateSection(sectionId, {
    tests: draft.sections.find((section) => section.id === sectionId).tests.map((test) => test.id === testId ? { ...test, ...changes } : test)
  });
  const updateTestStyle = (sectionId, testId, styleChanges) => {
    const section = draft.sections.find((item) => item.id === sectionId);
    const test = section.tests.find((item) => item.id === testId);
    updateTest(sectionId, testId, { style: { ...getTestStyle(test.style), ...styleChanges } });
  };
  const saveDraft = () => {
    saveTemplate(clone(draft));
    setEditing(false);
  };
  const discardDraft = () => {
    setDraft(clone(activeTmpl));
    setEditing(false);
    setNewDoctorName('');
  };
  const createDoctorTemplate = () => {
    const name = doctorName.trim();
    if (!name) return;
    const doctor = name.startsWith('Dr.') ? name : `Dr. ${name}`;
    const next = { ...clone(draft), id: `doctor-${createId()}`, name: `${doctor} Template`, forDoctor: doctor, doctors: [doctor] };
    saveTemplate(next);
    setDoctorName('');
    setSelectedTemplateId(next.id);
  };
  const addDoctorName = () => {
    const name = newDoctorName.trim();
    if (!name) return;
    const doctor = name.startsWith('Dr.') ? name : `Dr. ${name}`;
    const doctors = Array.from(new Set([...(draft.doctors || []), doctor]));
    const next = { ...clone(draft), doctors };
    setDraft(next);
    setEditing(true);
    setNewDoctorName('');
  };
  const updateDoctorName = (index, value) => {
    const doctors = [...(draft.doctors || [])];
    doctors[index] = value;
    updateDraft({ doctors });
  };
  const removeDoctorName = (index) => {
    const doctors = (draft.doctors || []).filter((_, doctorIndex) => doctorIndex !== index);
    updateDraft({ doctors });
  };
  const addSection = () => {
    const section = { id: createId(), name: 'New test group', tests: [] };
    updateDraft({ sections: [...draft.sections, section] });
  };
  const addTest = (sectionId) => {
    const section = draft.sections.find((item) => item.id === sectionId);
    updateSection(sectionId, { tests: [...section.tests, { id: createId(), name: 'New parameter', unit: '', referenceRange: '', options: [], abnormalOptions: [], criticalOptions: [], criticalLow: '', criticalHigh: '', formula: '', style: getTestStyle() }] });
  };
  const printSettings = getPrintSettings(draft);
  const updatePrintSetting = (key, value) => updateDraft({ printSettings: { ...printSettings, [key]: value } });
  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      window.alert('Signature image is too large — please use a file under 500KB');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updatePrintSetting('signatureImage', reader.result);
    reader.readAsDataURL(file);
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
              <span className="doctor-count">{(draft.doctors || []).length}</span>
            </div>
            <label className="doctor-template-label">Add doctor</label>
            <input className="doctor-template-input" value={newDoctorName} onChange={(event) => setNewDoctorName(event.target.value)} placeholder="Search or add doctor" list="templateDoctorSuggestions" />
            <datalist id="templateDoctorSuggestions">
              {(draft.doctors || []).map((doctor) => <option key={doctor} value={doctor} />)}
            </datalist>
            <button className="ghost-btn doctor-template-action" type="button" onClick={addDoctorName}>Add doctor</button>
            <div className="doctor-template-list">
              {(draft.doctors || []).length ? draft.doctors.map((doctor, index) => (
                <div className="doctor-template-row" key={`${doctor}-${index}`}>
                  {editing ? (
                    <input className="doctor-template-input" value={doctor} onChange={(event) => updateDoctorName(index, event.target.value)} />
                  ) : <span>{doctor}</span>}
                  {editing && <button className="doctor-template-remove" type="button" onClick={() => removeDoctorName(index)} aria-label={`Remove ${doctor}`} title={`Remove ${doctor}`}>×</button>}
                </div>
              )) : 'No doctors added'}
            </div>
            {!editing && <p className="doctor-directory-hint">Click Edit to rename or remove doctors.</p>}
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

          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 4px', color: 'var(--primary-strong)' }}>Print Layout {draft.forDoctor ? `— ${draft.forDoctor}` : '— Default'}</h4>
            <p className="muted-text" style={{ fontSize: '0.8rem', margin: '0 0 12px' }}>Match this doctor's own letterhead. These settings only affect reports printed with "{draft.name}".</p>
            {editing ? <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="field-group">
                  <label>Header space (px)</label>
                  <input type="number" min="0" max="400" value={printSettings.headerSpacing} onChange={(event) => updatePrintSetting('headerSpacing', Math.max(0, parseInt(event.target.value, 10) || 0))} />
                </div>
                <div className="field-group">
                  <label>Footer space (px)</label>
                  <input type="number" min="0" max="400" value={printSettings.footerSpacing} onChange={(event) => updatePrintSetting('footerSpacing', Math.max(0, parseInt(event.target.value, 10) || 0))} />
                </div>
                <div className="field-group">
                  <label>Patient info layout</label>
                  <select value={printSettings.metaLayout} onChange={(event) => updatePrintSetting('metaLayout', event.target.value)}>
                    <option value="default">Default</option>
                    <option value="reversed">Swapped</option>
                    <option value="centered">Centered</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Patient info style</label>
                  <select value={printSettings.metaBoxed ? 'boxed' : 'plain'} onChange={(event) => updatePrintSetting('metaBoxed', event.target.value === 'boxed')}>
                    <option value="plain">Plain</option>
                    <option value="boxed">Boxed</option>
                  </select>
                </div>
              </div>
              <div className="field-group" style={{ marginTop: '12px' }}>
                <label>Header text (optional)</label>
                <textarea rows="2" value={printSettings.headerText} onChange={(event) => updatePrintSetting('headerText', event.target.value)} placeholder="e.g. lab name, address, or a doctor-specific note" />
              </div>
              <div className="field-group" style={{ marginTop: '12px' }}>
                <label>Footer text (optional)</label>
                <textarea rows="2" value={printSettings.footerText} onChange={(event) => updatePrintSetting('footerText', event.target.value)} placeholder="e.g. lab address, registration number, or a closing note" />
              </div>
              <div className="field-group" style={{ marginTop: '12px' }}>
                <label>Signature image (optional)</label>
                <input type="file" accept="image/*" onChange={handleSignatureUpload} />
                {printSettings.signatureImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={printSettings.signatureImage} alt="Signature preview" style={{ maxHeight: '60px', maxWidth: '200px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }} />
                    <button className="ghost-btn" type="button" onClick={() => updatePrintSetting('signatureImage', '')}>Remove signature</button>
                  </div>
                )}
              </div>
            </> : (
              <p className="muted-text" style={{ fontSize: '0.85rem' }}>
                Header space: {printSettings.headerSpacing}px · Footer space: {printSettings.footerSpacing}px · Layout: {printSettings.metaLayout} · {printSettings.metaBoxed ? 'Boxed' : 'Plain'}
                {printSettings.signatureImage ? ' · Signature set' : ' · No signature'}
              </p>
            )}
          </div>

          <div className="sections-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {draft.sections?.map((section) => (
              <div key={section.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  {editing ? <input value={section.name} onChange={(event) => updateSection(section.id, { name: event.target.value })} /> : <h4 style={{ margin: 0, color: 'var(--primary-strong)' }}>{section.name}</h4>}
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{section.tests?.length || 0} Subtests</span>
                </div>

                <div className="table-responsive">
                  <table className="test-table" style={{ fontSize: '0.85rem' }}>
                    <thead><tr><th>Parameter</th><th>Unit</th><th>Reference Interval</th><th>Critical Limits / Formula</th><th>Style</th></tr></thead>
                    <tbody>
                      {section.tests?.map((test) => {
                        const style = getTestStyle(test.style);
                        return (
                        <tr key={test.id}>
                          <td>{editing ? <input value={test.name || ''} onChange={(event) => updateTest(section.id, test.id, { name: event.target.value })} /> : <strong style={{ fontWeight: style.bold ? 'bold' : 'normal', fontStyle: style.italic ? 'italic' : 'normal', textDecoration: style.underline ? 'underline' : 'none' }}>{test.name}</strong>}</td>
                          <td>{editing ? <input value={test.unit || ''} onChange={(event) => updateTest(section.id, test.id, { unit: event.target.value })} /> : (test.unit || '—')}</td>
                          <td>{editing ? <textarea rows="2" value={test.referenceRange || ''} onChange={(event) => updateTest(section.id, test.id, { referenceRange: event.target.value })} /> : (test.referenceRange || '—')}</td>
                          <td>
                            {editing ? <>
                              <input placeholder="Formula, e.g. {test-id}/5" value={test.formula || ''} onChange={(event) => updateTest(section.id, test.id, { formula: event.target.value })} />
                              <input placeholder="Critical low" value={test.criticalLow || ''} onChange={(event) => updateTest(section.id, test.id, { criticalLow: event.target.value })} />
                              <input placeholder="Critical high" value={test.criticalHigh || ''} onChange={(event) => updateTest(section.id, test.id, { criticalHigh: event.target.value })} />
                              <input placeholder="Options, comma separated" value={(test.options || []).join(', ')} onChange={(event) => updateTest(section.id, test.id, { options: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                              <input placeholder="Abnormal options, comma separated" value={(test.abnormalOptions || []).join(', ')} onChange={(event) => updateTest(section.id, test.id, { abnormalOptions: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                              <input placeholder="Critical options, comma separated" value={(test.criticalOptions || []).join(', ')} onChange={(event) => updateTest(section.id, test.id, { criticalOptions: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                            </> : <>
                              {test.formula && <span className="badge">Formula: {test.formula}</span>}
                              {test.criticalLow && <span className="badge" style={{ color: 'var(--danger)' }}>Min: {test.criticalLow}</span>}
                              {test.criticalHigh && <span className="badge" style={{ color: 'var(--danger)' }}>Max: {test.criticalHigh}</span>}
                              {!test.formula && !test.criticalLow && !test.criticalHigh && '—'}
                            </>}
                          </td>
                          <td style={{ minWidth: '220px' }}>
                            {editing ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select value={style.isHeading ? 'heading' : 'normal'} onChange={(event) => updateTestStyle(section.id, test.id, { isHeading: event.target.value === 'heading' })}>
                                <option value="normal">Normal test</option>
                                <option value="heading">Section heading</option>
                              </select>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <select style={{ flex: 1 }} value={resolveFontSizePx(style.fontSize)} onChange={(event) => updateTestStyle(section.id, test.id, { fontSize: Number(event.target.value) })}>
                                  {Array.from({ length: 16 }, (_, i) => i + 7).map((n) => <option key={n} value={n}>{n}pt</option>)}
                                </select>
                                <select style={{ flex: 1 }} value={style.fontFamily} onChange={(event) => updateTestStyle(section.id, test.id, { fontFamily: event.target.value })}>
                                  <option value="">Default font</option>
                                  {WORD_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
                                </select>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button type="button" className={`ghost-btn ${style.bold ? 'active' : ''}`} style={{ flex: 1, fontWeight: 'bold' }} onClick={() => updateTestStyle(section.id, test.id, { bold: !style.bold })}>B</button>
                                <button type="button" className={`ghost-btn ${style.italic ? 'active' : ''}`} style={{ flex: 1, fontStyle: 'italic' }} onClick={() => updateTestStyle(section.id, test.id, { italic: !style.italic })}>I</button>
                                <button type="button" className={`ghost-btn ${style.underline ? 'active' : ''}`} style={{ flex: 1, textDecoration: 'underline' }} onClick={() => updateTestStyle(section.id, test.id, { underline: !style.underline })}>U</button>
                              </div>
                            </div> : <>
                              {style.isHeading && <span className="badge">Heading</span>}
                              {(style.bold || style.italic || style.underline) && (
                                <span style={{ fontWeight: style.bold ? 'bold' : 'normal', fontStyle: style.italic ? 'italic' : 'normal', textDecoration: style.underline ? 'underline' : 'none' }}>
                                  Aa
                                </span>
                              )}
                              {!style.isHeading && !style.bold && !style.italic && !style.underline && '—'}
                            </>}
                          </td>
                        </tr>
                      );})}
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
