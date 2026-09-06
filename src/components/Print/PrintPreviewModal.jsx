import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  isAbnormalResult,
  isCriticalResult,
  extractGenderRangeSegment
} from '../../utils/clinicalCalculations.js';
import { formatSavedAt, testStyleToCss, getPrintSettings } from '../../utils/formatters.js';

export function PrintPreviewModal() {
  const { previewReport, setPreviewReport, settings, templates } = useApp();

  if (!previewReport) return null;

  const { patient, tests, savedAt } = previewReport;
  const gender = patient?.gender || 'M';
  const hasCriticalInReport = tests?.some((group) => group.tests?.some((t) => isCriticalResult(t, gender)));

  // Print layout (header/footer spacing, signature, meta layout) is
  // configured per-template in Templates — a doctor's custom template
  // can have its own letterhead settings distinct from the default.
  // Resolve the actual template this specific report was built from,
  // rather than assuming the default.
  const reportTemplate = templates.find((t) => t.id === previewReport.templateId) || templates[0];
  const printSettings = getPrintSettings(reportTemplate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="preview-overlay">
      <div className="preview-panel">
        <header className="preview-header no-print">
          <div>
            <h2 style={{ margin: 0 }}>Print Preview</h2>
            <p className="muted-text" style={{ margin: '4px 0 0' }}>
              Review report layout before printing or saving to PDF.
            </p>
          </div>
          <div className="preview-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="ghost-btn" onClick={() => setPreviewReport(null)}>
              Close
            </button>
            <button className="primary-btn" onClick={handlePrint}>
              Print / Save PDF
            </button>
          </div>
        </header>

        <div className="preview-body" id="printableReport">
          {/* Top Letterhead Spacing if configured */}
          {printSettings.headerSpacing > 0 ? (
            <div style={{ height: `${printSettings.headerSpacing}px` }} />
          ) : (
            <div className="print-lab-header">
              <div style={{ textAlign: 'center', borderBottom: '2px solid #163256', paddingBottom: '12px', marginBottom: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#163256', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {settings.labName || 'Arun Clinical Lab'}
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#5d7287' }}>
                  {settings.labTagline || 'Diagnostics & pathology reporting'}
                </p>
                {(settings.address || settings.phone) && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#5d7287' }}>
                    {[settings.address, settings.phone, settings.email].filter(Boolean).join(' | ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {printSettings.headerText && (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginBottom: '10px' }}>
              {printSettings.headerText}
            </div>
          )}

          {/* Patient Metadata Grid */}
          <div className={`print-patient-meta ${printSettings.metaBoxed ? 'boxed-meta' : ''}`} style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: printSettings.metaLayout === 'centered' ? '1fr' : 'repeat(2, 1fr)',
                gap: '8px 24px',
                border: printSettings.metaBoxed ? '1px solid #333' : '1px solid #d7e3ee',
                padding: '12px',
                borderRadius: '6px',
                textAlign: printSettings.metaLayout === 'centered' ? 'center' : 'left',
                direction: printSettings.metaLayout === 'reversed' ? 'rtl' : 'ltr'
              }}
            >
              <div style={{ direction: 'ltr' }}><strong>Patient Name:</strong> {patient?.name || '—'}</div>
              <div style={{ direction: 'ltr' }}><strong>Age / Gender:</strong> {patient?.age || '—'} / {gender === 'F' ? 'Female' : 'Male'}</div>
              <div style={{ direction: 'ltr' }}><strong>Ref. By Doctor:</strong> {patient?.doctor || 'Self'}</div>
              <div style={{ direction: 'ltr' }}><strong>Sample Date:</strong> {patient?.sampleCollectedAt ? patient.sampleCollectedAt.replace('T', ' ') : '—'}</div>
              <div style={{ direction: 'ltr' }}><strong>Report Date:</strong> {patient?.reportDate || (savedAt ? formatSavedAt(savedAt) : '—')}</div>
              <div style={{ direction: 'ltr' }}><strong>Report ID:</strong> {previewReport.historyId || previewReport.id || 'LR-TEMP'}</div>
            </div>
          </div>

          {/* Tests Table */}
          <div className="print-tests-container">
            {tests?.filter((group) => group.tests?.length > 0).map((group) => (
              <div key={group.id} className="print-test-group" style={{ marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d7e3ee', textAlign: 'left', color: '#5d7287' }}>
                      <th style={{ padding: '6px', width: '38%' }}>Test / Parameter</th>
                      <th style={{ padding: '6px', width: '22%' }}>Observed Value</th>
                      <th style={{ padding: '6px', width: '15%' }}>Unit</th>
                      <th style={{ padding: '6px', width: '25%' }}>Biological Ref. Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tests?.map((t) => {
                      const abnormal = isAbnormalResult(t, gender);
                      const critical = isCriticalResult(t, gender);
                      const genderRange = extractGenderRangeSegment(t.referenceRange, gender);
                      const nameCss = testStyleToCss(t.style);

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #edf3f6' }}>
                          <td style={{ padding: '6px', ...nameCss, fontWeight: (abnormal || critical) ? '700' : nameCss.fontWeight }}>
                            {t.name}
                          </td>
                          <td style={{ padding: '6px', fontWeight: abnormal || critical ? '700' : 'normal', color: critical ? '#d74a4a' : abnormal ? '#163256' : 'inherit' }}>
                            {t.value || '—'} {critical ? '*' : ''}
                          </td>
                          <td style={{ padding: '6px', color: '#5d7287' }}>{t.unit || '—'}</td>
                          <td style={{ padding: '6px', color: '#5d7287', whiteSpace: 'pre-line' }}>
                            {genderRange || t.referenceRange || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {hasCriticalInReport && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#b91c1c', fontWeight: '700', marginTop: '18px' }}>
              * Critical value — requires urgent physician attention
            </div>
          )}

          {/* End of Report & Signatures */}
          <div style={{ textAlign: 'center', margin: '24px 0 12px', fontSize: '0.8rem', color: '#8c9ba5' }}>
            *** END OF REPORT ***
          </div>

          <div className="print-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: '#5d7287' }}>
              <div>Printed: {new Date().toLocaleString()}</div>
              <div>Report generated by Arun Clinical Lab</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {printSettings.signatureImage && (
                <img
                  src={printSettings.signatureImage}
                  alt="Pathologist Signature"
                  style={{ maxHeight: '60px', marginBottom: '4px' }}
                />
              )}
              <div style={{ borderTop: '1px solid #000', width: '180px', paddingTop: '4px', fontWeight: '600', fontSize: '0.85rem' }}>
                Medical Lab Technologist / Pathologist
              </div>
            </div>
          </div>

          {printSettings.footerText && (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', textAlign: 'center', marginTop: '16px' }}>
              {printSettings.footerText}
            </div>
          )}

          {printSettings.footerSpacing > 0 && (
            <div style={{ height: `${printSettings.footerSpacing}px` }} />
          )}
        </div>
      </div>
    </div>
  );
}
