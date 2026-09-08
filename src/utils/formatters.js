export function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMultilineText(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

export function normalizeDoctorName(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'Dr.';
  return trimmed.startsWith('Dr.') ? trimmed : `Dr. ${trimmed}`;
}

export function formatSavedAt(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function getLocalDateTimeValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getLocalDateValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getIndiaDateTimeValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  const indiaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return `${indiaTime.getUTCFullYear()}-${pad(indiaTime.getUTCMonth() + 1)}-${pad(indiaTime.getUTCDate())}T${pad(indiaTime.getUTCHours())}:${pad(indiaTime.getUTCMinutes())}`;
}

export function getIndiaDateValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  const indiaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return `${indiaTime.getUTCFullYear()}-${pad(indiaTime.getUTCMonth() + 1)}-${pad(indiaTime.getUTCDate())}`;
}

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toFixed(2)}`;
}
