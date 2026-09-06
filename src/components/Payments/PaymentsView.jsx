import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function PaymentsView() {
  const { activeSheet, updateActiveSheetBilling, history } = useApp();
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  if (!activeSheet) return null;
  const billing = activeSheet.billing || {
    totalAmount: 500,
    discount: 0,
    paidAmount: 500,
    paymentMethod: 'Cash',
    status: 'Paid'
  };

  const netAmount = Math.max(0, (parseFloat(billing.totalAmount) || 0) - (parseFloat(billing.discount) || 0));
  const balanceDue = Math.max(0, netAmount - (parseFloat(billing.paidAmount) || 0));

  const handlePrintReceipt = () => {
    window.print();
  };

  // --- Cross-patient payment ledger, built from every saved report ---
  const doctorsInLedger = Array.from(new Set(history.map((entry) => entry.patient?.doctor).filter(Boolean))).sort();

  const ledgerEntries = history.filter((entry) => {
    const patient = entry.patient || {};
    const doctor = patient.doctor || 'Unassigned';
    const name = patient.name || 'Unnamed patient';
    const date = patient.reportDate || (entry.savedAt || '').slice(0, 10) || '';
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${name} ${doctor}`.toLowerCase().includes(query);
    const matchesDoctor = doctorFilter === 'all' || doctor === doctorFilter;
    const matchesFrom = !fromDate || date >= fromDate;
    const matchesTo = !toDate || date <= toDate;
    return matchesSearch && matchesDoctor && matchesFrom && matchesTo;
  });

  const ledgerTotal = ledgerEntries.reduce((sum, entry) => sum + (parseFloat(entry.billing?.paidAmount) || 0), 0);
  const ledgerAverage = ledgerEntries.length ? ledgerTotal / ledgerEntries.length : 0;

  const clearFilters = () => {
    setSearch('');
    setDoctorFilter('all');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="view-container payments-view">
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <h2>Billing & Payment Management</h2>
        <p className="muted-text">Manage charges, concessions, and issue payment receipts for {activeSheet.patient?.name || 'Active Patient'}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 460px) 1fr', gap: '24px', marginBottom: '28px' }}>
        <div className="card billing-form-card">
          <h3 style={{ marginBottom: '16px' }}>Invoice Details</h3>

          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field-group">
              <label>Total Investigation Charges (₹)</label>
              <input
                type="number"
                min="0"
                value={billing.totalAmount || ''}
                onChange={(e) => updateActiveSheetBilling('totalAmount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field-group">
              <label>Discount / Concession (₹)</label>
              <input
                type="number"
                min="0"
                value={billing.discount || ''}
                onChange={(e) => updateActiveSheetBilling('discount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field-group">
              <label>Amount Paid (₹)</label>
              <input
                type="number"
                min="0"
                value={billing.paidAmount || ''}
                onChange={(e) => updateActiveSheetBilling('paidAmount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field-row" style={{ display: 'flex', gap: '12px' }}>
              <div className="field-group" style={{ flex: '1' }}>
                <label>Payment Method</label>
                <select
                  value={billing.paymentMethod || 'Cash'}
                  onChange={(e) => updateActiveSheetBilling('paymentMethod', e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="field-group" style={{ flex: '1' }}>
                <label>Payment Status</label>
                <select
                  value={billing.status || 'Paid'}
                  onChange={(e) => updateActiveSheetBilling('status', e.target.value)}
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>
          <p className="muted-text" style={{ fontSize: '0.78rem', marginTop: '10px' }}>
            This applies to the currently open report. Click Save on the Report Editor to record it in the ledger below.
          </p>
        </div>

        <div className="card receipt-preview-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Receipt Summary</h3>
            <button className="primary-btn" onClick={handlePrintReceipt}>
              Print Receipt
            </button>
          </div>

          <div style={{ border: '1px dashed var(--border)', borderRadius: '8px', padding: '20px', backgroundColor: 'var(--panel-strong)' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Arun Clinical Lab</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>Official Payment Receipt</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
              <div><strong>Patient:</strong> {activeSheet.patient?.name || 'Walk-in'}</div>
              <div><strong>Date:</strong> {activeSheet.patient?.reportDate || new Date().toISOString().slice(0, 10)}</div>
              <div><strong>Age/Gender:</strong> {activeSheet.patient?.age || '—'} / {activeSheet.patient?.gender || 'M'}</div>
              <div><strong>Ref Doctor:</strong> {activeSheet.patient?.doctor || 'Self'}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Charges:</span>
                <strong>{formatCurrency(billing.totalAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>Discount:</span>
                <span>- {formatCurrency(billing.discount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <strong>Net Payable:</strong>
                <strong style={{ color: 'var(--primary)' }}>{formatCurrency(netAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Paid Amount:</span>
                <strong>{formatCurrency(billing.paidAmount)}</strong>
              </div>
              {balanceDue > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <strong>Balance Due:</strong>
                  <strong>{formatCurrency(balanceDue)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Payment ledger across every saved report --- */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Collection Ledger</h3>
            <p className="muted-text" style={{ margin: '4px 0 0' }}>Every saved report's payment, searchable across patients and doctors.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div className="metric-card"><span>Collected total</span><strong>{formatCurrency(ledgerTotal)}</strong></div>
          <div className="metric-card"><span>Patients</span><strong>{ledgerEntries.length}</strong></div>
          <div className="metric-card"><span>Average collection</span><strong>{formatCurrency(ledgerAverage)}</strong></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div className="field-group">
            <label>Search patient or doctor</label>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ledger" />
          </div>
          <div className="field-group">
            <label>Reference Doctor</label>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
              <option value="all">All doctors</option>
              {doctorsInLedger.map((doctor) => <option key={doctor} value={doctor}>{doctor}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label>From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="field-group">
            <label>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="ghost-btn" type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        </div>

        {ledgerEntries.length ? (
          <div className="table-responsive">
            <table className="payment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Patient Name</th>
                  <th style={{ padding: '8px' }}>Reference Doctor</th>
                  <th style={{ padding: '8px' }}>Report Date</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Status</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Collected Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.historyId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}><strong>{entry.patient?.name || 'Unnamed patient'}</strong></td>
                    <td style={{ padding: '8px' }}>{entry.patient?.doctor || 'Unassigned'}</td>
                    <td style={{ padding: '8px' }}>{entry.patient?.reportDate || (entry.savedAt || '').slice(0, 10) || '—'}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{entry.billing?.status || '—'}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}><strong>{formatCurrency(entry.billing?.paidAmount)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="4" style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(ledgerTotal)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '24px' }}>
            <strong>No payment records found</strong>
            <p className="muted-text" style={{ margin: '4px 0 0' }}>Save a report with at least one test to add it to this ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
}
