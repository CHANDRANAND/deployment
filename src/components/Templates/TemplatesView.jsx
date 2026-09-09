import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { createId } from '../../utils/formatters.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

/* ─── Shared Font Select ──────────────────────────────────────────── */
function FontSelect({ value, onChange, style: extraStyle = {} }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ fontFamily: value || 'inherit', ...extraStyle }}
      title="Font family"
    >
      <option value="">— Default font —</option>
      <optgroup label="Web-safe">
        {['Arial', 'Arial Black', 'Courier New', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'].map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </optgroup>
      <optgroup label="Google Fonts">
        {['Calibri', 'Cambria', 'Garamond', 'Lato', 'Merriweather', 'Montserrat', 'Open Sans', 'Playfair Display', 'PT Sans', 'Raleway', 'Roboto', 'Source Sans 3', 'Ubuntu'].map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </optgroup>
    </select>
  );
}

/* ─── Style Controls Row ─────────────────────────────────────────── */
function StyleControls({ label, styleObj, onChange }) {
  const upd = (patch) => onChange({ ...styleObj, ...patch });
  return (
    <div className="style-controls-row">
      {label && <span className="style-ctrl-label">{label}</span>}
      <FontSelect value={styleObj?.fontFamily || ''} onChange={(v) => upd({ fontFamily: v })} />
      <input
        type="number" min="8" max="48" placeholder="Size"
        value={styleObj?.fontSize || 14}
        onChange={(e) => upd({ fontSize: Number(e.target.value) || 14 })}
        style={{ width: '60px' }} title="Font size"
      />
      <select value={styleObj?.alignment || 'left'} onChange={(e) => upd({ alignment: e.target.value })} title="Alignment">
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
      <label title="Bold"><input type="checkbox" checked={!!styleObj?.bold} onChange={(e) => upd({ bold: e.target.checked })} /> B</label>
      <label title="Italic"><input type="checkbox" checked={!!styleObj?.italic} onChange={(e) => upd({ italic: e.target.checked })} /> I</label>
      <label title="Underline"><input type="checkbox" checked={!!styleObj?.underline} onChange={(e) => upd({ underline: e.target.checked })} /> U</label>
    </div>
  );
}

/* ─── Default style objects ──────────────────────────────────────── */
const DEFAULT_TEST_STYLE = { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' };
const DEFAULT_HEADING_STYLE = { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' };
const DEFAULT_SUBHEADING_STYLE = { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' };

/* ─── Test Row ───────────────────────────────────────────────────── */
function TestRow({ test, sectionId, sectionInEdit, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  const upd = (patch) => onUpdate(sectionId, test.id, patch);
  const isHeading = test.type === 'heading';

  return (
    <div className={`test-row ${isHeading ? 'test-row--heading' : 'test-row--normal'} ${expanded ? 'test-row--expanded' : ''}`}>
      {/* ── Summary bar ──────────────────────────────────────────── */}
      <div className="test-row-summary">
        {/* Type badge — always click-to-toggle */}
        <button
          className={`type-badge ${isHeading ? 'type-badge--heading' : 'type-badge--normal'}`}
          type="button"
          title="Click to toggle Heading / Normal"
          onClick={() => upd({ type: isHeading ? 'normal' : 'heading' })}
        >
          {isHeading ? 'HEADING' : 'NORMAL'}
        </button>

        {/* Name — editable inline */}
        <input
          className="test-row-name-input"
          value={test.name || ''}
          onChange={(e) => upd({ name: e.target.value })}
          placeholder="Parameter name"
          style={{
            fontWeight: (test.style?.bold || isHeading) ? '700' : 'normal',
            fontStyle: test.style?.italic ? 'italic' : 'normal',
            textDecoration: test.style?.underline ? 'underline' : 'none',
            fontFamily: test.style?.fontFamily || 'inherit',
            fontSize: `${test.style?.fontSize || 14}px`,
          }}
        />

        {!isHeading && (
          <>
            <input
              className="test-row-unit-input"
              value={test.unit || ''}
              onChange={(e) => upd({ unit: e.target.value })}
              placeholder="Unit"
              title="Unit"
            />
            <input
              className="test-row-range-input"
              value={test.referenceRange || ''}
              onChange={(e) => upd({ referenceRange: e.target.value })}
              placeholder="Reference range (use | for gender split)"
              title="Reference range"
            />
          </>
        )}

        {/* Expand / Delete */}
        <button
          className={`expand-btn ${expanded ? 'expand-btn--open' : ''}`}
          type="button"
          title={expanded ? 'Collapse options' : 'Expand options'}
          onClick={() => setExpanded((v) => !v)}
        >▾</button>
        <button
          className="remove-test-btn"
          type="button"
          title="Delete this entry"
          onClick={() => onRemove(sectionId, test.id)}
        >×</button>
      </div>

      {/* ── Expanded panel ───────────────────────────────────────── */}
      {expanded && (
        <div className="test-row-detail">
          {isHeading ? (
            /* Heading-only style controls */
            <StyleControls
              label="Heading style"
              styleObj={test.style || DEFAULT_HEADING_STYLE}
              onChange={(s) => upd({ style: s })}
            />
          ) : (
            <>
              <StyleControls
                label="Text style"
                styleObj={test.style || DEFAULT_TEST_STYLE}
                onChange={(s) => upd({ style: s })}
              />
              <div className="test-extra-fields">
                <label>Formula
                  <input
                    value={test.formula || ''}
                    onChange={(e) => upd({ formula: e.target.value })}
                    placeholder="e.g. {albumin} / {globulin}"
                  />
                </label>
                <label>Dropdown options
                  <input
                    value={(test.options || []).join(', ')}
                    onChange={(e) => upd({ options: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
                    placeholder="Comma-separated values, e.g. Negative, Positive"
                  />
                </label>
                <label>Abnormal options
                  <input
                    value={(test.abnormalOptions || []).join(', ')}
                    onChange={(e) => upd({ abnormalOptions: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
                    placeholder="Which options count as abnormal"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Section Card ───────────────────────────────────────────────── */
function SectionCard({ section, isEditing, onStartEdit, onDoneEdit, onUpdate, onRemoveSection, onUpdateTest, onRemoveTest, onAddTest }) {
  const updSection = (patch) => onUpdate(section.id, patch);

  return (
    <div className={`section-card ${isEditing ? 'section-card--editing' : ''}`}>
      {/* Section header */}
      <div className="section-card-header">
        <div className="section-card-title">
          {isEditing
            ? <input
                className="section-name-input"
                value={section.name}
                onChange={(e) => updSection({ name: e.target.value })}
                placeholder="Section name"
              />
            : <h4 style={{
                margin: 0,
                color: 'var(--primary-strong)',
                fontFamily: section.headingStyle?.fontFamily || 'inherit',
                fontSize: `${section.headingStyle?.fontSize || 15}px`,
                fontWeight: section.headingStyle?.bold !== false ? '700' : '600',
                fontStyle: section.headingStyle?.italic ? 'italic' : 'normal',
                textDecoration: section.headingStyle?.underline ? 'underline' : 'none',
                textAlign: section.headingStyle?.alignment || 'left',
              }}>
                {section.name}
              </h4>
          }
          <span className="section-count-badge">{section.tests?.length || 0} entries</span>
        </div>
        <div className="section-card-actions">
          {isEditing
            ? <button className="primary-btn btn-sm" type="button" onClick={onDoneEdit}>✔ Done</button>
            : <button className="ghost-btn btn-sm" type="button" onClick={onStartEdit}>✏ Edit Section</button>
          }
          {isEditing && (
            <button className="danger-btn btn-sm" type="button" onClick={() => onRemoveSection(section.id)}>
              🗑 Delete Section
            </button>
          )}
        </div>
      </div>

      {/* Section style controls (only when editing) */}
      {isEditing && (
        <div className="section-style-panel">
          <StyleControls
            label="Section heading style"
            styleObj={section.headingStyle || DEFAULT_HEADING_STYLE}
            onChange={(s) => updSection({ headingStyle: s })}
          />
          <div className="subheading-row">
            <input
              className="subheading-input"
              placeholder="Optional subheading under this section"
              value={section.subheading || ''}
              onChange={(e) => updSection({ subheading: e.target.value })}
            />
          </div>
          {section.subheading && (
            <StyleControls
              label="Subheading style"
              styleObj={section.subheadingStyle || DEFAULT_SUBHEADING_STYLE}
              onChange={(s) => updSection({ subheadingStyle: s })}
            />
          )}
        </div>
      )}

      {/* Test entries */}
      <div className="test-entries">
        {section.tests?.map((test) => (
          <TestRow
            key={test.id}
            test={test}
            sectionId={section.id}
            sectionInEdit={isEditing}
            onUpdate={onUpdateTest}
            onRemove={onRemoveTest}
          />
        ))}
        {section.tests?.length === 0 && (
          <p className="no-tests-hint">No entries yet. Click "+ Add Heading" or "+ Add Test" to begin.</p>
        )}
      </div>

      {/* Add buttons (always visible) */}
      <div className="section-add-row">
        <button className="add-heading-btn" type="button"
          onClick={() => onAddTest(section.id, 'heading')}>
          + Add Heading
        </button>
        <button className="add-test-btn" type="button"
          onClick={() => onAddTest(section.id, 'normal')}>
          + Add Test
        </button>
      </div>
    </div>
  );
}

/* ─── Main View ──────────────────────────────────────────────────── */
export function TemplatesView() {
  const { templates, saveTemplate, deleteTemplate } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => templates[0]?.id || '');
  const [draft, setDraft] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);

  // Doctor panel state
  const [doctorEditing, setDoctorEditing] = useState(false);
  const [doctorDraft, setDoctorDraft] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');

  const activeTmpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Keep selectedTemplateId pointing at a real template when the list changes
  useEffect(() => {
    if (templates.length === 0) return;
    const exists = templates.some((t) => t.id === selectedTemplateId);
    if (!exists) setSelectedTemplateId(templates[0].id);
  }, [templates]);

  useEffect(() => {
    setDraft(activeTmpl ? clone(activeTmpl) : null);
    setEditingSectionId(null);
    setDoctorEditing(false);
    setDoctorDraft(clone(activeTmpl?.doctors || []));
  }, [selectedTemplateId, templates]);

  /* ── ALL hooks MUST be before any early return (Rules of Hooks) ─ */
  const updateDraft = useCallback((changes) => setDraft((d) => ({ ...d, ...changes })), []);

  const updateSection = useCallback((sectionId, changes) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => s.id === sectionId ? { ...s, ...changes } : s)
    }));
  }, []);

  const updateTest = useCallback((sectionId, testId, changes) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, tests: s.tests.map((t) => t.id === testId ? { ...t, ...changes } : t) };
      })
    }));
  }, []);

  const removeTest = useCallback((sectionId, testId) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, tests: s.tests.filter((t) => t.id !== testId) };
      })
    }));
  }, []);

  const addTest = useCallback((sectionId, type = 'normal') => {
    const defaultStyle = type === 'heading' ? clone(DEFAULT_HEADING_STYLE) : clone(DEFAULT_TEST_STYLE);
    const newEntry = {
      id: createId(),
      type,
      name: type === 'heading' ? 'New Heading' : 'New Parameter',
      unit: '',
      referenceRange: '',
      formula: '',
      options: [],
      abnormalOptions: [],
      criticalOptions: [],
      style: defaultStyle,
    };
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, tests: [...s.tests, newEntry] };
      })
    }));
  }, []);

  /* ── Safe to early-return here — all hooks already called above ─ */
  if (!draft) {
    return (
      <div className="view-container templates-view">
        <div className="view-header" style={{ marginBottom: '20px' }}>
          <h2>Test Templates &amp; Reference Range Builder</h2>
          <p className="muted-text">Loading templates…</p>
        </div>
      </div>
    );
  }

  /* ── Non-hook helpers (need draft, so defined after guard) ──── */
  const addSection = () => {
    const newSection = {
      id: createId(),
      name: 'New Test Group',
      subheading: '',
      headingStyle: clone(DEFAULT_HEADING_STYLE),
      subheadingStyle: clone(DEFAULT_SUBHEADING_STYLE),
      tests: []
    };
    updateDraft({ sections: [...draft.sections, newSection] });
    setEditingSectionId(newSection.id);
  };

  const removeSection = (sectionId) => {
    updateDraft({ sections: draft.sections.filter((s) => s.id !== sectionId) });
    setEditingSectionId(null);
  };

  const saveDraft = () => {
    saveTemplate(clone(draft));
    setEditingSectionId(null);
  };

  /* ── Doctor helpers ──────────────────────────────────────────── */
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
    setDoctorDraft(Array.from(new Set([...doctorDraft, name])));
    setDoctorEditing(true);
    setNewDoctorName('');
  };
  const saveDoctors = () => {
    saveTemplate({ ...clone(activeTmpl), doctors: doctorDraft.filter(Boolean) });
    setDoctorEditing(false);
  };

  return (
    <div className="view-container templates-view">
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <h2>Test Templates & Reference Range Builder</h2>
        <p className="muted-text">Manage test profiles, biological intervals, and formatting for each parameter.</p>
      </div>

      <div className="templates-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="templates-sidebar card">
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Templates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {templates.map((t) => (
              <button
                key={t.id}
                className={`nav-pill ${t.id === draft.id ? 'active' : ''}`}
                style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
              >
                {t.forDoctor ? `${t.forDoctor} Template` : t.name}
              </button>
            ))}
          </div>

          {/* Doctor template creator */}
          <div className="doctor-template-panel">
            <div className="doctor-template-heading">
              <div>
                <h3>Doctors Templates</h3>
                <p>Create a doctor-specific copy of this template.</p>
              </div>
              <span className="doctor-template-mark">DR</span>
            </div>
            <label className="doctor-template-label">Create template for</label>
            <input className="doctor-template-input" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="e.g. Dr. Sharma" />
            <button className="secondary-btn doctor-template-action" type="button" onClick={createDoctorTemplate}>Create from selected</button>
          </div>

          {/* Doctor directory */}
          <div className="doctor-directory-panel">
            <div className="doctor-template-heading">
              <div>
                <h3>Doctors</h3>
                <p>Names available in the Ref. Doctor search.</p>
              </div>
              <span className="doctor-count">{doctorDraft.length}</span>
            </div>
            <label className="doctor-template-label">Add doctor</label>
            <input className="doctor-template-input" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="Search or add doctor" list="templateDoctorSuggestions" />
            <datalist id="templateDoctorSuggestions">
              {(draft.doctors || []).map((d) => <option key={d} value={d} />)}
            </datalist>
            <div className="doctor-directory-actions">
              {!doctorEditing
                ? <button className="ghost-btn doctor-template-action" type="button" onClick={() => setDoctorEditing(true)}>Edit doctors</button>
                : <>
                    <button className="ghost-btn doctor-template-action" type="button" onClick={() => { setDoctorDraft(clone(activeTmpl.doctors || [])); setDoctorEditing(false); }}>Discard</button>
                    <button className="primary-btn doctor-template-action" type="button" onClick={saveDoctors}>Save doctors</button>
                  </>
              }
              <button className="ghost-btn doctor-template-action" type="button" onClick={addDoctorName}>Add doctor</button>
            </div>
            <div className="doctor-template-list">
              {doctorDraft.length ? doctorDraft.map((d, i) => (
                <div className="doctor-template-row" key={`${d}-${i}`}>
                  {doctorEditing
                    ? <input className="doctor-template-input" value={d} onChange={(e) => { const arr = [...doctorDraft]; arr[i] = e.target.value; setDoctorDraft(arr); }} />
                    : <span>{d}</span>
                  }
                  {doctorEditing && <button className="doctor-template-remove" type="button" onClick={() => setDoctorDraft(doctorDraft.filter((_, idx) => idx !== i))}>×</button>}
                </div>
              )) : 'No doctors added'}
            </div>
            {!doctorEditing && <p className="doctor-directory-hint">Use Edit doctors to rename or remove doctors.</p>}
          </div>
        </div>

        {/* ── Main panel ───────────────────────────────────────── */}
        <div className="template-details card">
          {/* Template name + save bar */}
          <div className="template-top-bar">
            <input
              className="template-name-input"
              value={draft.name || ''}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="Template name"
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                {draft.sections?.length || 0} Sections
              </span>
              <button className="primary-btn" type="button" onClick={saveDraft}>💾 Save Template</button>
              {draft.forDoctor && (
                <button className="ghost-btn" type="button" style={{ color: 'var(--danger)' }} onClick={() => deleteTemplate(draft.id)}>
                  Delete Template
                </button>
              )}
            </div>
          </div>

          {/* Section cards */}
          <div className="sections-list">
            {draft.sections?.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isEditing={editingSectionId === section.id}
                onStartEdit={() => setEditingSectionId(section.id)}
                onDoneEdit={() => setEditingSectionId(null)}
                onUpdate={updateSection}
                onRemoveSection={removeSection}
                onUpdateTest={updateTest}
                onRemoveTest={removeTest}
                onAddTest={addTest}
              />
            ))}
          </div>

          <button className="secondary-btn add-section-btn" type="button" onClick={addSection}>
            + Add New Section
          </button>
        </div>
      </div>
    </div>
  );
}
