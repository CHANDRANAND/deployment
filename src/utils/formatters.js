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

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toFixed(2)}`;
}

// Returns a font size number 7-22 to be used as `pt` (points) — the same
// unit Word uses for font size, so typing "9" here looks the same size
// as "9" in a Word document.
export function resolveFontSizePx(fontSize) {
  const legacyMap = { small: 12, medium: 14, large: 16, xlarge: 18 };
  if (fontSize === undefined || fontSize === null || fontSize === '') return 14;
  if (legacyMap[fontSize] !== undefined) return legacyMap[fontSize];
  const numeric = parseFloat(fontSize);
  if (!isFinite(numeric)) return 14;
  return Math.min(22, Math.max(7, numeric));
}

// Common fonts bundled with Microsoft Word, offered so a lab can match
// the exact look of their existing paper letterhead.
export const WORD_FONTS = [
  'Arial', 'Calibri', 'Cambria', 'Candara', 'Century Gothic', 'Comic Sans MS',
  'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium',
  'Garamond', 'Georgia', 'Book Antiqua', 'Lucida Sans Unicode', 'Palatino Linotype',
  'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
];

export function getPrintSettings(template) {
  const defaults = { headerSpacing: 0, footerSpacing: 0, headerText: '', footerText: '', metaLayout: 'default', metaBoxed: false, signatureImage: '' };
  return { ...defaults, ...(template?.printSettings || {}) };
}

export function getTestStyle(style) {
  return {
    isHeading: false,
    fontSize: 14,
    fontFamily: '',
    alignment: 'left',
    bold: false,
    italic: false,
    underline: false,
    ...(style || {})
  };
}

export function testStyleToCss(style) {
  const s = getTestStyle(style);
  return {
    fontSize: `${resolveFontSizePx(s.fontSize)}pt`,
    fontFamily: s.fontFamily ? `'${s.fontFamily}', inherit` : 'inherit',
    textAlign: s.alignment,
    fontWeight: s.bold ? 'bold' : 'normal',
    fontStyle: s.italic ? 'italic' : 'normal',
    textDecoration: s.underline ? 'underline' : 'none'
  };
}
