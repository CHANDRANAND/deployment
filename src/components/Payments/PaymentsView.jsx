import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function PaymentsView() {
  const { activeSheet, updateActiveSheetBilling, showToast } = useApp();

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

  return (
    <div className="view-container payments-view">
      <div className="view-header" style={{ marginBottom: '20px' }}>
        <h2>Billing & Payment Management</h2>
        <p className="muted-text">Manage charges, concessions, and issue payment receipts for {activeSheet.patient?.name || 'Active Patient'}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 460px) 1fr', gap: '24px' }}>
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
    </div>
  );
}
