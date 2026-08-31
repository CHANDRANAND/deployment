/* ============================================================
   LAB REPORT SYSTEM — bundled app.js
   Single file for maximum compatibility (safe to open
   index.html directly from any folder, incl. straight out of
   a zip/rar, with no relative-path 404 risk).

   Organized as the same modules as the source project (src/):
     1. UTILS          - src/utils.js
     2. TEMPLATES DATA - src/templates-data.js
     3. STATE          - src/state.js
     4. RENDER         - src/render.js
     5. PATIENT MODULE - src/patient-module.js
     6. HISTORY MODULE - src/history-module.js
     7. PRINT MODULE   - src/print-module.js
     8. APP ENTRY      - src/entry.js
   ============================================================ */


/* ---------- src/utils.js ---------- */

/* ============================================================
   UTILS MODULE
   Small, dependency-free helpers shared by every other module.
   Loaded first — nothing here reads from `state`.
   ============================================================ */

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeDoctorName(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'Dr.';
  return trimmed.startsWith('Dr.') ? trimmed : `Dr. ${trimmed}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

function formatSavedAt(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/* ----------------------------------------------------------------
   Reference-range parsing & abnormal-result detection.

   Real lab reports bold a result when it falls outside the
   biological reference range, and leave it plain when it's inside
   the range. Some tests (HIV, HBsAg, Blood Group...) have no
   numeric range at all — they're answered from a fixed list
   (Reactive/Non-Reactive, Positive/Negative) instead, so "abnormal"
   there means "the chosen option was flagged as abnormal" rather
   than "outside a number range". And plenty of tests simply have no
   reference value entered yet — that's a normal, silent case: no
   bolding, no error, nothing shown in that column.
   ---------------------------------------------------------------- */

function extractGenderRangeSegment(rangeText, gender) {
  if (!rangeText) return '';
  const text = String(rangeText);
  const hasMale = /\bM\s*:/i.test(text);
  const hasFemale = /\bF\s*:/i.test(text);
  if (!hasMale || !hasFemale) return text;

  const parts = text.split('|').map((part) => part.trim());
  const male = parts.find((part) => /^M\s*:/i.test(part));
  const female = parts.find((part) => /^F\s*:/i.test(part));
  const chosen = gender === 'F' ? female : male;
  return (chosen || text).replace(/^[MF]\s*:\s*/i, '');
}

function parseNumericBounds(rangeText) {
  if (!rangeText) return null;
  const text = String(rangeText).trim();

  let match = text.match(/(-?\d+(?:\.\d+)?)\s*(?:-|to)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) return { low: parseFloat(match[1]), high: parseFloat(match[2]) };

  match = text.match(/(?:<=|≤|up\s*to)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) return { low: -Infinity, high: parseFloat(match[1]) };

  match = text.match(/^<\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: -Infinity, high: parseFloat(match[1]) };

  match = text.match(/(?:>=|≥)\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: parseFloat(match[1]), high: Infinity };

  match = text.match(/^>\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: parseFloat(match[1]), high: Infinity };

  return null;
}

function parseNumericValue(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/,/g, '').trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  return parseFloat(match[0]);
}

function isAbnormalResult(test, gender) {
  if (!test || !test.value) return false;

  const rangeSegment = extractGenderRangeSegment(test.referenceRange, gender);
  const bounds = parseNumericBounds(rangeSegment);
  const numericValue = parseNumericValue(test.value);
  if (bounds && numericValue !== null) {
    return numericValue < bounds.low || numericValue > bounds.high;
  }

  if (Array.isArray(test.abnormalOptions) && test.abnormalOptions.length) {
    return test.abnormalOptions.some((option) => option.trim().toLowerCase() === String(test.value).trim().toLowerCase());
  }

  return false;
}

/* ----------------------------------------------------------------
   Critical (panic) value flagging.

   A critical value is more urgent than a merely "abnormal" one —
   it's a result extreme enough that the ordering doctor should be
   notified right away, not just noted on the printed report. Real
   panic-value thresholds vary by lab, instrument, and local
   protocol, so this app never assumes them: a critical range is
   only ever flagged if the lab has explicitly entered a critical
   low/high (or critical options, for list-based tests) for that
   specific test in the Templates builder. No threshold, no flag —
   this stays silent by default until staff configure it.
   ---------------------------------------------------------------- */

function isCriticalResult(test, gender) {
  if (!test || !test.value) return false;

  const hasCriticalLow = test.criticalLow !== undefined && test.criticalLow !== null && test.criticalLow !== '';
  const hasCriticalHigh = test.criticalHigh !== undefined && test.criticalHigh !== null && test.criticalHigh !== '';
  if (hasCriticalLow || hasCriticalHigh) {
    const numericValue = parseNumericValue(test.value);
    if (numericValue === null) return false;
    if (hasCriticalLow && numericValue < parseFloat(test.criticalLow)) return true;
    if (hasCriticalHigh && numericValue > parseFloat(test.criticalHigh)) return true;
    return false;
  }

  if (Array.isArray(test.criticalOptions) && test.criticalOptions.length) {
    return test.criticalOptions.some((option) => option.trim().toLowerCase() === String(test.value).trim().toLowerCase());
  }

  return false;
}

/* ----------------------------------------------------------------
   Computed / formula tests (e.g. VLDL, ratios in Lipid Profile,
   A/G ratio in LFT). A test can reference sibling test values in
   the same component using {test-id} tokens, e.g.
   "{triglycerides} / 5" or "{total-cholesterol} / {hdl-cholesterol}".
   The result is computed fresh from whatever the lab has entered
   for the referenced tests; if any referenced value is blank or
   non-numeric, the formula test is simply left blank rather than
   guessing. Only digits, arithmetic operators, and parentheses are
   ever evaluated — never arbitrary text — so this stays safe even
   though it uses Function() under the hood.
   ---------------------------------------------------------------- */

function evaluateFormula(formula, component) {
  if (!formula || !component) return '';

  let missing = false;
  const expression = String(formula).replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, id) => {
    const sibling = component.tests.find((item) => item.id === id);
    const numericValue = sibling ? parseNumericValue(sibling.value) : null;
    if (numericValue === null) {
      missing = true;
      return '0';
    }
    return numericValue;
  });

  if (missing) return '';
  if (!/^[\d\s+\-*/().]+$/.test(expression)) return '';

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    if (typeof result !== 'number' || !isFinite(result)) return '';
    return String(Math.round(result * 100) / 100);
  } catch (err) {
    return '';
  }
}

function recalculateFormulas(component) {
  if (!component || !Array.isArray(component.tests)) return;
  component.tests.forEach((test) => {
    if (test.formula) {
      test.value = evaluateFormula(test.formula, component);
    }
  });
}

/* ---------- src/templates-data.js ---------- */

/* ============================================================
   TEMPLATES DATA MODULE
   The real lab test catalog (sourced from NewlabReports.docx).
   Pure data — no functions, no state, no DOM. Every other
   module treats this as read-only reference data and clones
   it via cloneTemplates() in state.js before mutating it.
   ============================================================ */

const defaultTemplates = [
  {
    id: 'core-lab',
    name: 'Comprehensive Lab Panel',
    doctors: ['Dr. Sharma', 'Dr. Mehta'],
    mainTests: [
      'Hematology - Complete Haemogram',
      'Differential WBC Count',
      'Malaria & Widal',
      'Biochemistry',
      'Lipid Profile',
      'Liver Function Test',
      'Liver Enzymes',
      'Urine Examination - Physical',
      'Urine Examination - Microscopic',
      'HbA1c & Glucose',
      'Serology - Blood Group',
      'Coagulation Profile',
      'Serology - Infectious Screening',
      'Serum Electrolytes'
    ],
    sections: [
      {
        id: 'hematology',
        name: 'Hematology - Complete Haemogram',
        tests: [
          { id: 'haemoglobin', name: 'Haemoglobin', unit: 'gm%', referenceRange: 'M: 13.5 - 16.5 gm/dl | F: 11.5 - 14.5 gm/dl' },
          { id: 'trbc', name: 'TRBC (Erythrocytes)', unit: 'millions/cumm', referenceRange: 'M: 4.0 - 6.0 | F: 3.5 - 5.5 millions/cumm' },
          { id: 'pcv', name: 'PCV', unit: '%', referenceRange: 'M: 40 - 52% | F: 37 - 47%' },
          { id: 'mcv', name: 'MCV', unit: 'fl', referenceRange: '82 - 94 fl' },
          { id: 'mch', name: 'MCH', unit: 'Pg', referenceRange: '27 - 32 Pg' },
          { id: 'mchc', name: 'MCHC', unit: '%', referenceRange: '30 - 36%' },
          { id: 'twbc', name: 'TWBC', unit: 'Cells/cumm', referenceRange: '4,000 - 11,000/cumm (1-12yr: 4,000-14,000)' },
          { id: 'platelet-count', name: 'Platelet Count (Thrombocytes)', unit: 'Lakhs/cumm', referenceRange: '1.5 - 4.5 Lakhs/cumm' },
          { id: 'esr', name: 'ESR', unit: 'mm/1hr', referenceRange: '0 - 20 mm' },
          { id: 'crp', name: 'CRP ("C" Reactive Protein)', unit: 'mg/dL', referenceRange: 'Normal: < 6 mg/dL' }
        ]
      },
      {
        id: 'differential-wbc',
        name: 'Differential WBC Count',
        tests: [
          { id: 'polymorphs', name: 'Polymorphs', unit: '%', referenceRange: '40 - 75%' },
          { id: 'lymphocytes', name: 'Lymphocytes', unit: '%', referenceRange: 'Adult: 24 - 44% | Child: 35 - 65%' },
          { id: 'eosinophils', name: 'Eosinophils', unit: '%', referenceRange: '< 3%' },
          { id: 'monocytes', name: 'Monocytes', unit: '%', referenceRange: '< 4%' },
          { id: 'basophils', name: 'Basophils', unit: '%', referenceRange: '< 1%' }
        ]
      },
      {
        id: 'malaria-widal',
        name: 'Malaria & Widal',
        tests: [
          { id: 'malaria', name: 'Malaria (P.f & P.v)', unit: '', referenceRange: 'Negative', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'] },
          { id: 's-typhi-o', name: 'S. Typhi "O"', unit: 'dilution', referenceRange: '' },
          { id: 's-typhi-h', name: 'S. Typhi "H"', unit: 'dilution', referenceRange: '' }
        ]
      },
      {
        id: 'biochemistry',
        name: 'Biochemistry',
        tests: [
          { id: 'total-bilirubin-bio', name: 'Total Bilirubin', unit: 'mg/dl', referenceRange: '< 1.2 mg/dl' },
          { id: 'random-blood-sugar', name: 'Random Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 140 mg/dl' },
          { id: 'fasting-blood-sugar', name: 'Fasting Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 110 mg/dl' },
          { id: 'postprandial-blood-sugar', name: 'Postprandial Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 160 mg/dl' },
          { id: 'serum-calcium', name: 'Serum Calcium', unit: 'mg/dl', referenceRange: '8.0 - 11.0 mg/dl' },
          { id: 'serum-creatinine', name: 'Serum Creatinine', unit: 'mg/dl', referenceRange: '0.5 - 1.4 mg/dl' },
          { id: 'amylase', name: 'Amylase (Serum)', unit: 'U/L', referenceRange: 'Up to 90 U/L' },
          { id: 'lipase', name: 'Lipase (Serum)', unit: 'U/L', referenceRange: 'Up to 60 U/L' }
        ]
      },
      {
        id: 'lipid-profile',
        name: 'Lipid Profile',
        tests: [
          { id: 'total-cholesterol', name: 'Total Cholesterol', unit: 'mg/dl', referenceRange: 'Desirable: < 200 | Borderline: 200-239 | High: > 240' },
          { id: 'triglycerides', name: 'Triglycerides', unit: 'mg/dl', referenceRange: 'M: 60-165 mg/dl | F: 40-140 mg/dl' },
          { id: 'hdl-cholesterol', name: 'HDL Cholesterol (Direct)', unit: 'mg/dl', referenceRange: 'M: 35-80 mg/dl | F: 42-88 mg/dl' },
          { id: 'ldl-cholesterol', name: 'LDL Cholesterol', unit: 'mg/dl', referenceRange: 'Optimal: <100 | Near optimal: 100-129 | Borderline high: 130-159 | High: 160-189 | Very high: >=190' },
          { id: 'vldl-cholesterol', name: 'VLDL Cholesterol', unit: 'mg/dl', referenceRange: '< 40 mg/dl' },
          { id: 'chol-hdl-ratio', name: 'Total Cholesterol / HDL Ratio', unit: 'ratio', referenceRange: '3.5 - 4.4' },
          { id: 'ldl-hdl-ratio', name: 'LDL Cholesterol / HDL Ratio', unit: 'ratio', referenceRange: '1.8 - 3.0' }
        ]
      },
      {
        id: 'lft',
        name: 'Liver Function Test',
        tests: [
          { id: 'total-bilirubin-lft', name: 'Total Bilirubin', unit: 'mg/dl', referenceRange: '< 1.2 mg/dl' },
          { id: 'direct-bilirubin', name: 'Direct Bilirubin', unit: 'mg/dl', referenceRange: '< 0.3 mg/dl' },
          { id: 'indirect-bilirubin', name: 'Indirect Bilirubin', unit: 'mg/dl', referenceRange: '< 0.9 mg/dl' }
        ]
      },
      {
        id: 'liver-enzymes',
        name: 'Liver Enzymes',
        tests: [
          { id: 'sgpt-alt', name: 'SGPT / ALT', unit: 'IU/L', referenceRange: '< 46 IU/L' },
          { id: 'sgot-ast', name: 'SGOT / AST', unit: 'IU/L', referenceRange: '< 46 IU/L' },
          { id: 'alp', name: 'A L P', unit: 'IU/L', referenceRange: '70 - 306 IU/L' },
          { id: 'total-proteins', name: 'Total Proteins', unit: 'mg/dl', referenceRange: '6 - 8 mg/dl' },
          { id: 'albumin', name: 'Albumin', unit: 'mg/dl', referenceRange: '3.4 - 5.5 mg/dl' },
          { id: 'globulin', name: 'Globulin', unit: 'mg/dl', referenceRange: '2.0 - 3.5 mg/dl' },
          { id: 'ag-ratio', name: 'A/G Ratio', unit: 'mg/dl', referenceRange: '0.8 - 2.0 mg/dl' }
        ]
      },
      {
        id: 'urine-physical',
        name: 'Urine Examination - Physical',
        tests: [
          { id: 'urine-colour', name: 'Colour', unit: '', referenceRange: '' },
          { id: 'urine-appearance', name: 'Appearance', unit: '', referenceRange: '' },
          { id: 'urine-albumin', name: 'Urine Albumin', unit: '', referenceRange: 'Nil' },
          { id: 'urine-sugar', name: 'Urine Sugar', unit: '', referenceRange: 'Nil' },
          { id: 'bile-salts', name: 'Bile Salts', unit: '', referenceRange: 'Negative' },
          { id: 'bile-pigments', name: 'Bile Pigments', unit: '', referenceRange: 'Negative' }
        ]
      },
      {
        id: 'urine-microscopic',
        name: 'Urine Examination - Microscopic',
        tests: [
          { id: 'pus-cells', name: 'Pus Cells', unit: '/hpf', referenceRange: '' },
          { id: 'epithelial-cells', name: 'Epithelial Cells', unit: '/hpf', referenceRange: '' },
          { id: 'urine-rbc', name: 'RBC', unit: '/hpf', referenceRange: 'Nil' },
          { id: 'casts', name: 'Casts', unit: '', referenceRange: 'Nil' },
          { id: 'crystals', name: 'Crystals', unit: '', referenceRange: 'Nil' },
          { id: 'bacteria', name: 'Bacteria', unit: '', referenceRange: 'Nil' },
          { id: 'mucus', name: 'Mucus', unit: '', referenceRange: 'Nil' },
          { id: 'urine-others', name: 'Others', unit: '', referenceRange: 'Nil' }
        ]
      },
      {
        id: 'hba1c-section',
        name: 'HbA1c & Glucose',
        tests: [
          { id: 'hba1c', name: 'HbA1c', unit: '%', referenceRange: '4-6 Non-diabetic | 6-7 Good control | 7-8 Fair control | 8-10 Unsatisfactory | >10 Poor control' },
          { id: 'avg-blood-glucose', name: 'Average Blood Glucose', unit: 'mg/dl', referenceRange: '' }
        ]
      },
      {
        id: 'blood-group',
        name: 'Serology - Blood Group',
        tests: [
          { id: 'blood-grouping', name: 'Blood Grouping', unit: '', referenceRange: '', options: ['A', 'B', 'AB', 'O'] },
          { id: 'rh-typing', name: 'Rh Typing', unit: '', referenceRange: '', options: ['Positive', 'Negative'] }
        ]
      },
      {
        id: 'coagulation',
        name: 'Coagulation Profile',
        tests: [
          { id: 'bt', name: 'BT (Bleeding Time)', unit: 'min:sec', referenceRange: '0 - 3 minutes' },
          { id: 'ct', name: 'CT (Clotting Time)', unit: 'min:sec', referenceRange: '3 - 7 minutes' }
        ]
      },
      {
        id: 'serology-infectious',
        name: 'Serology - Infectious Screening',
        tests: [
          { id: 'hiv-1', name: 'HIV I (Tridot Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'] },
          { id: 'hiv-2', name: 'HIV II (Tridot Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'] },
          { id: 'hbsag', name: 'HBsAg (Strip Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'] },
          { id: 'hepatitis-c', name: 'Hepatitis C Virus', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'] }
        ]
      },
      {
        id: 'electrolytes',
        name: 'Serum Electrolytes',
        tests: [
          { id: 'sodium', name: 'Sodium', unit: 'mmol/L', referenceRange: '135.0 - 150 mmol/L' },
          { id: 'potassium', name: 'Potassium', unit: 'mmol/L', referenceRange: '3.5 - 5.5 mmol/L' },
          { id: 'chloride', name: 'Chloride', unit: 'mmol/L', referenceRange: '94 - 110 mmol/L' },
          { id: 'ionized-calcium', name: 'Ionized Calcium', unit: 'mmol/L', referenceRange: '1.10 - 1.32 mmol/L' }
        ]
      }
    ]
  }
];

/* ---------- src/state.js ---------- */

/* ============================================================
   STATE MODULE (shared data layer)
   Owns the in-memory `state` object, localStorage persistence,
   and the read-only getters every feature module relies on:
   getActiveSheet, getActiveTemplate, getCurrentSection,
   getActiveComponent, getTemplateById.

   Depends on: utils.js, templates-data.js
   Depended on by: everything else (patient-module, history-module,
   print-module, render.js, app.js).
   ============================================================ */

const STORAGE_KEY = 'lab-report-system-state-v5';
const SUPABASE_URL = 'https://zqaswazhdzjkmgbjbmja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXN3YXpoZHpqa21nYmpibWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTYyNTYsImV4cCI6MjEwMzQ5MjI1Nn0.v_qkPtbVe3cHtzVnUcY1jUwgv9qqMbsMrwMUEpUr8gg';
const AUTH_REDIRECT_URL = 'https://deployment-liard-eight.vercel.app/index.html';
let currentUser = null;
let supabaseDb = null;

let supabaseReady = false;
let authStage = 'credentials';
let authMode = 'signin';
let authSubmitting = false;
let sessionTimeout = null;
let lastActivityTime = Date.now();
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_WARNING_MS = 13 * 60 * 1000; // Show warning at 13 minutes

function resetSessionTimeout() {
  lastActivityTime = Date.now();
  if (sessionTimeout) clearTimeout(sessionTimeout);
  
  if (supabaseReady && currentUser) {
    sessionTimeout = setTimeout(() => {
      if (supabaseReady && currentUser) {
        showToast('Session expired. Please sign in again.');
        handleSignOut();
      }
    }, SESSION_TIMEOUT_MS);
  }
}

function setupActivityTracking() {
  if (!supabaseReady) return;
  document.addEventListener('click', resetSessionTimeout);
  document.addEventListener('keydown', resetSessionTimeout);
  document.addEventListener('scroll', resetSessionTimeout);
}

async function hashMpin(mpin) {
  const bytes = new TextEncoder().encode(`${currentUser.id}:${mpin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function backgroundStorageKey() {
  return currentUser ? `lab-login-background-${currentUser.id}` : 'lab-login-background-guest';
}

function mediaStorageKey(type) {
  return `${type}-${backgroundStorageKey()}`;
}

function applyLoginBackground() {
  const image = localStorage.getItem(backgroundStorageKey());
  document.documentElement.style.setProperty('--auth-background-image', image ? `url("${image}")` : 'none');
  const logo = localStorage.getItem(mediaStorageKey('lab-login-logo'));
  const brandMark = document.getElementById('authBrandMark');
  if (brandMark) {
    brandMark.textContent = logo ? '' : 'LR';
    brandMark.style.backgroundImage = logo ? `url("${logo}")` : '';
    brandMark.classList.toggle('has-logo', Boolean(logo));
  }
}

function localProfileStorageKey() {
  return currentUser ? `lab-user-profile-${currentUser.id}` : 'lab-user-profile-guest';
}

function readLocalProfile() {
  const raw = localStorage.getItem(localProfileStorageKey());
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to read local profile fallback', error);
    return null;
  }
}

function writeLocalProfile(profile) {
  if (!currentUser) return;
  localStorage.setItem(localProfileStorageKey(), JSON.stringify(profile));
}

function setAuthStage(stage) {
  authStage = stage;
  const emailGroup = document.getElementById('authEmailGroup');
  const passwordGroup = document.getElementById('authPasswordGroup');
  const mpinGroup = document.getElementById('authMpinGroup');
  const mediaGroup = document.getElementById('authMediaGroup');
  const toggle = document.getElementById('authToggleBtn');
  const submit = document.getElementById('authSubmitBtn');
  const description = document.getElementById('authDescription');
  const mpinLabel = document.getElementById('authMpinLabel');
  const mpinInput = document.getElementById('authMpin');
  const emailInput = document.getElementById('authEmail');
  const isCredentials = stage === 'credentials';
  emailGroup?.classList.toggle('hidden-field', !isCredentials);
  passwordGroup?.classList.toggle('hidden-field', !isCredentials);
  mpinGroup?.classList.toggle('hidden-field', isCredentials);
  mediaGroup?.classList.toggle('hidden-field', !(isCredentials && authMode === 'signup'));
  if (stage === 'setup') {
    description.textContent = 'Create a 4 to 6 digit MPIN for quick sign-in on this device.';
    mpinLabel.textContent = 'Create MPIN';
    submit.textContent = 'Save MPIN';
    toggle.classList.add('hidden-field');
    setTimeout(() => mpinInput?.focus(), 100);
  } else if (stage === 'mpin') {
    description.textContent = `Enter your MPIN to continue as ${currentUser?.email || 'this user'}.`;
    mpinLabel.textContent = 'MPIN';
    submit.textContent = 'Unlock workspace';
    toggle.classList.add('hidden-field');
    mpinInput.value = '';
    setTimeout(() => mpinInput?.focus(), 100);
  } else {
    description.textContent = authMode === 'signup' ? 'Create a secure account for your reports and payments.' : 'Sign in to access your reports and payments.';
    submit.textContent = authMode === 'signup' ? 'Create account' : 'Sign in';
    toggle.textContent = authMode === 'signup' ? 'I already have an account' : 'Create an account';
    toggle.classList.remove('hidden-field');
    setTimeout(() => emailInput?.focus(), 100);
  }
  applyLoginBackground();
}

async function getUserProfile() {
  const localProfile = readLocalProfile();
  if (!supabaseDb || !currentUser) return localProfile;

  try {
    const { data, error } = await supabaseDb.from('lab_user_profiles').select('mpin_hash, background_data, logo_data').eq('id', currentUser.id).maybeSingle();
    if (error) {
      console.warn('Supabase profile fetch failed; using local fallback', error);
      return localProfile;
    }

    const profile = data || localProfile || {};
    if (profile.background_data) localStorage.setItem(backgroundStorageKey(), profile.background_data);
    if (profile.logo_data) localStorage.setItem(mediaStorageKey('lab-login-logo'), profile.logo_data);
    if (profile.mpin_hash || profile.background_data || profile.logo_data) {
      writeLocalProfile(profile);
    }
    applyLoginBackground();
    return profile;
  } catch (error) {
    console.warn('Unable to read user profile; using local fallback', error);
    return localProfile;
  }
}

function readImageFile(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 2 * 1024 * 1024) {
    setAuthMessage('Choose an image smaller than 2 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

async function saveProfileMedia() {
  if (!currentUser) return;
  const background = localStorage.getItem(backgroundStorageKey());
  const logo = localStorage.getItem(mediaStorageKey('lab-login-logo'));
  const profile = { id: currentUser.id, background_data: background, logo_data: logo };

  if (!supabaseDb) {
    writeLocalProfile({ ...readLocalProfile(), ...profile });
    return;
  }

  try {
    const { error } = await supabaseDb.from('lab_user_profiles').upsert(profile);
    if (error) throw error;
  } catch (error) {
    console.warn('Unable to save profile branding; keeping local device copy', error);
    writeLocalProfile({ ...readLocalProfile(), ...profile });
  }
}

async function prepareUserAuth() {
  try {
    console.log('🔐 prepareUserAuth called, currentUser:', currentUser?.email);
    const profile = await getUserProfile();
    console.log('✓ getUserProfile returned:', profile);
    const stage = profile?.mpin_hash ? 'mpin' : 'setup';
    console.log('🔄 Setting auth stage to:', stage);
    setAuthStage(stage);
    console.log('✓ Auth stage set successfully');
  } catch (error) {
    console.error('✗ prepareUserAuth failed:', error);
    setAuthMessage('Could not load your security profile. Run the updated database schema.');
    console.warn('Unable to load user profile', error);
  }
}

function cloneTemplates() {
  return JSON.parse(JSON.stringify(defaultTemplates));
}

function recoverTemplates(templates) {
  if (!Array.isArray(templates) || !templates.length) return cloneTemplates();
  const coreTemplate = templates.find((template) => template.id === 'core-lab');
  const coreTestCount = coreTemplate?.sections?.reduce((total, section) => total + (section.tests?.length || 0), 0) || 0;
  if (coreTemplate && coreTemplate.sections.length <= 1 && coreTestCount === 0) {
    return cloneTemplates();
  }
  return templates;
}

function makeComponent(name = 'Main Test', tests = []) {
  return {
    id: createId(),
    name,
    tests
  };
}

function getDefaultTestsForComponentName(name, template) {
  if (!name || !template) return [];
  const normalizedName = name.toString().trim().toLowerCase();
  const section = template.sections.find((item) => item.id.toLowerCase() === normalizedName || item.name.toLowerCase() === normalizedName);
  if (!section) return [];
  return section.tests.map((test) => ({
    id: test.id,
    name: test.name,
    unit: test.unit || '',
    referenceRange: test.referenceRange || '',
    options: Array.isArray(test.options) ? test.options.slice() : undefined,
    abnormalOptions: Array.isArray(test.abnormalOptions) ? test.abnormalOptions.slice() : undefined,
    criticalLow: test.criticalLow,
    criticalHigh: test.criticalHigh,
    criticalOptions: Array.isArray(test.criticalOptions) ? test.criticalOptions.slice() : undefined,
    formula: test.formula || undefined,
    value: ''
  }));
}

function makeSheet() {
  const template = getTemplateById('core-lab');
  const componentName = template.mainTests[0] || 'CBC';
  const component = makeComponent(componentName, getDefaultTestsForComponentName(componentName, template));
  return {
    id: createId(),
    patient: {
      name: '',
      age: '',
      gender: 'M',
      amountPaid: '',
      doctor: normalizeDoctorName(template.doctors[0]),
      date: new Date().toISOString().split('T')[0]
    },
    templateId: template.id,
    activeComponentId: component.id,
    tests: [component]
  };
}

const state = {
  sheets: [],
  activeSheetId: null,
  activeSectionId: 'cbc',
  templates: cloneTemplates(),
  view: 'editor',
  history: [],
  builderEditingTestId: null
};

function normalizeSheet(sheet) {
  if (!sheet || typeof sheet !== 'object') return makeSheet();
  if (!Array.isArray(sheet.tests)) {
    sheet.tests = [];
  }
  if (!sheet.tests.length) {
    const template = getTemplateById(sheet.templateId);
    const componentName = template.mainTests[0] || 'CBC';
    const component = makeComponent(componentName, getDefaultTestsForComponentName(componentName, template));
    sheet.tests = [component];
  }

  if (sheet.tests.length && !Array.isArray(sheet.tests[0].tests)) {
    const legacyTests = sheet.tests.map((test) => ({
      id: test.id || createId(),
      name: test.name,
      unit: test.unit || '',
      referenceRange: test.referenceRange || '',
      value: test.value || ''
    }));
    sheet.tests = [makeComponent('CBC')];
    sheet.tests[0].tests = legacyTests;
  }

  const template = getTemplateById(sheet.templateId || 'core-lab');
  sheet.tests = sheet.tests.map((component) => {
    if (!Array.isArray(component.tests)) {
      component.tests = [];
    }
    if (component.tests.length === 0) {
      const defaultTests = getDefaultTestsForComponentName(component.name, template);
      if (defaultTests.length > 0) {
        component.tests = defaultTests;
      }
    }
    return component;
  });

  if (!sheet.activeComponentId || !sheet.tests.some((component) => component.id === sheet.activeComponentId)) {
    sheet.activeComponentId = sheet.tests[0].id;
  }

  return sheet;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.sheets) && parsed.sheets.length) {
      state.sheets = parsed.sheets.map(normalizeSheet);
      state.activeSheetId = parsed.activeSheetId || parsed.sheets[0].id;
      state.activeSectionId = parsed.activeSectionId || 'cbc';
      const recoveredTemplates = recoverTemplates(parsed.templates);
      state.templates = recoveredTemplates;
      state.history = Array.isArray(parsed.history) ? parsed.history : [];
      if (recoveredTemplates !== parsed.templates) persistState();
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to read local storage', error);
  }

  state.sheets = [makeSheet()];
  state.activeSheetId = state.sheets[0].id;
  persistState();
  return null;
}

function persistState() {
  const payload = {
    sheets: state.sheets,
    activeSheetId: state.activeSheetId,
    activeSectionId: state.activeSectionId,
    templates: state.templates,
    history: state.history
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  if (supabaseReady && currentUser) {
    supabaseDb.from('lab_app_state').upsert({
      id: currentUser.id,
      owner_id: currentUser.id,
      payload,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Unable to sync state to Supabase', error);
    });
  }
}

async function syncFromSupabase() {
  if (!supabaseDb || !currentUser) {
    return;
  }
  const { data, error } = await supabaseDb.from('lab_app_state').select('payload').eq('id', currentUser.id).maybeSingle();
  if (error) {
    console.warn('Supabase is unavailable; using local storage', error);
    showToast('Using local storage');
    return;
  }
  if (data?.payload?.sheets?.length) {
    state.sheets = data.payload.sheets.map(normalizeSheet);
    state.activeSheetId = data.payload.activeSheetId || state.sheets[0].id;
    state.activeSectionId = data.payload.activeSectionId || 'cbc';
    state.templates = recoverTemplates(data.payload.templates);
    state.history = Array.isArray(data.payload.history) ? data.payload.history : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.payload));
    render();
  } else {
    supabaseReady = true;
    persistState();
    showToast('Supabase connected');
    return;
  }
  supabaseReady = true;
  showToast('Supabase connected');
}

function setAuthMessage(message) {
  const error = document.getElementById('authError');
  if (error) error.textContent = message || '';
}

function updateAuthMode(isSignUp) {
  authMode = isSignUp ? 'signup' : 'signin';
  document.getElementById('authPassword').autocomplete = isSignUp ? 'new-password' : 'current-password';
  setAuthStage('credentials');
}

function showAuthenticatedApp() {
  document.getElementById('authOverlay')?.classList.add('hidden');
  document.querySelector('.app-shell')?.classList.remove('auth-locked');
  setupActivityTracking();
  resetSessionTimeout();
}

async function handleSignOut() {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    sessionTimeout = null;
  }
  document.removeEventListener('click', resetSessionTimeout);
  document.removeEventListener('keydown', resetSessionTimeout);
  document.removeEventListener('scroll', resetSessionTimeout);
  try {
    await supabaseDb?.auth.signOut();
  } catch (error) {
    console.warn('Supabase sign-out failed', error);
  }

  currentUser = null;
  supabaseReady = false;
  authStage = 'credentials';
  authMode = 'signin';
  const authForm = document.getElementById('authForm');
  if (authForm) authForm.reset();
  const authMpin = document.getElementById('authMpin');
  if (authMpin) authMpin.value = '';
  const appShell = document.querySelector('.app-shell');
  if (appShell) appShell.classList.add('auth-locked');
  const authOverlay = document.getElementById('authOverlay');
  if (authOverlay) authOverlay.classList.remove('hidden');
  setAuthMessage('');
  setAuthStage('credentials');
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  console.log('🔐 handleAuthSubmit called');
  if (authSubmitting) return;
  if (!supabaseDb) {
    console.error('🔐 supabaseDb is not initialized');
    setAuthMessage('Supabase client not initialized. Cannot authenticate.');
    showToast('Error: Supabase not ready');
    return;
  }
  authSubmitting = true;
  const submitButton = document.getElementById('authSubmitBtn');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Please wait...';
  
  try {
    const mpin = document.getElementById('authMpin').value;
    if (authStage === 'mpin') {
      if (!/^[0-9]{4,6}$/.test(mpin)) {
        setAuthMessage('Enter a 4 to 6 digit MPIN.');
        authSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
      }
      try {
        const profile = await getUserProfile();
        const savedHash = profile?.mpin_hash || readLocalProfile()?.mpin_hash;
        if (!savedHash || (await hashMpin(mpin)) !== savedHash) {
          setAuthMessage('Incorrect MPIN. Try again.');
          document.getElementById('authMpin').value = '';
          authSubmitting = false;
          submitButton.disabled = false;
          submitButton.textContent = originalText;
          document.getElementById('authMpin').focus();
          return;
        }
        showAuthenticatedApp();
        await syncFromSupabase();
        setAuthMessage('');
      } catch (error) {
        setAuthMessage('Could not verify MPIN. Please try again.');
        authSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
      return;
    }
    if (authStage === 'setup') {
      if (!/^[0-9]{4,6}$/.test(mpin)) {
        setAuthMessage('MPIN must contain 4 to 6 digits.');
        authSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
      }

      const profile = {
        id: currentUser.id,
        mpin_hash: await hashMpin(mpin),
        background_data: localStorage.getItem(backgroundStorageKey()),
        logo_data: localStorage.getItem(mediaStorageKey('lab-login-logo'))
      };

      try {
        if (supabaseDb) {
          const { error } = await supabaseDb.from('lab_user_profiles').upsert(profile);
          if (error) throw error;
        }
        writeLocalProfile(profile);
      } catch (error) {
        console.warn('Supabase profile save failed; keeping local MPIN fallback', error);
        writeLocalProfile(profile);
        setAuthMessage('MPIN saved on this device. Cloud sync is temporarily unavailable.');
      }

      showAuthenticatedApp();
      await syncFromSupabase();
      setAuthMessage('');
      return;
    }
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const result = authMode === 'signup'
      ? await supabaseDb.auth.signUp({ email, password, options: { emailRedirectTo: AUTH_REDIRECT_URL } })
      : await supabaseDb.auth.signInWithPassword({ email, password });
    console.log('Auth result:', result);
    if (result.error) {
      const errorMsg = result.error.message || 'Authentication failed';
      console.error('Auth error:', result.error);
      setAuthMessage(errorMsg);
      authSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      showToast('Error: ' + errorMsg);
      return;
    }
    if (authMode === 'signup' && !result.data.session) {
      updateAuthMode(false);
      setAuthMessage('Account created. Check your email to confirm it, then sign in here.');
      authSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      return;
    }
    console.log('✓ Auth successful, setting currentUser');
    currentUser = result.data.user;
    console.log('✓ currentUser set to:', currentUser?.email);
    const authMpinForReset = document.getElementById('authMpin');
    if (authMpinForReset) authMpinForReset.value = '';
    console.log('🔄 Calling prepareUserAuth...');
    await prepareUserAuth();
    console.log('✓ prepareUserAuth completed');
    authSubmitting = false;
    submitButton.disabled = false;
  } catch (error) {
    const message = String(error?.message || 'Unable to complete authentication.');
    const displayMsg = message.includes('429') || message.toLowerCase().includes('too many')
      ? 'Too many attempts. Wait a few seconds, then try again.'
      : message.includes('INTERNET_DISCONNECTED') || message.includes('net::ERR')
      ? 'Network error: Cannot reach Supabase. Check your internet connection and try again.'
      : message;
    
    console.error('✗ Auth error in catch block:', error);
    console.error('✗ Display message:', displayMsg);
    setAuthMessage(displayMsg);
    showToast('Login failed: ' + displayMsg);
    authSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  } finally {
    console.log('🔄 handleAuthSubmit finally block, authSubmitting:', authSubmitting);
    if (authSubmitting) {
      authSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
}

async function initializeAuth() {
  if (!supabaseDb) {
    setAuthMessage('Supabase client could not load. Check your internet connection.');
    return;
  }
  const { data } = await supabaseDb.auth.getSession();
  if (data.session?.user) {
    currentUser = data.session.user;
    await prepareUserAuth();
  }
  supabaseDb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      supabaseReady = false;
      authStage = 'credentials';
      authMode = 'signin';
      const signedOutAuthForm = document.getElementById('authForm');
      if (signedOutAuthForm) signedOutAuthForm.reset();
      const signedOutMpin = document.getElementById('authMpin');
      if (signedOutMpin) signedOutMpin.value = '';
      const signedOutAppShell = document.querySelector('.app-shell');
      if (signedOutAppShell) signedOutAppShell.classList.add('auth-locked');
      const signedOutOverlay = document.getElementById('authOverlay');
      if (signedOutOverlay) signedOutOverlay.classList.remove('hidden');
      setAuthMessage('');
      setAuthStage('credentials');
    }
  });
}

function getActiveSheet() {
  if (!Array.isArray(state.sheets) || state.sheets.length === 0) {
    state.sheets = [makeSheet()];
    state.activeSheetId = state.sheets[0].id;
    persistState();
  }

  const activeSheet = state.sheets.find((sheet) => sheet.id === state.activeSheetId) || state.sheets[0];
  if (!activeSheet) {
    state.sheets = [makeSheet()];
    state.activeSheetId = state.sheets[0].id;
    persistState();
    return state.sheets[0];
  }

  return normalizeSheet(activeSheet);
}

function getTemplateById(id) {
  return state.templates.find((template) => template.id === id) || state.templates[0];
}

function getActiveTemplate() {
  return getTemplateById(getActiveSheet().templateId);
}

function getCurrentSection(template) {
  return template.sections.find((section) => section.id === state.activeSectionId) || template.sections[0];
}

function getActiveComponent(sheet) {
  const normalizedSheet = normalizeSheet(sheet);
  return normalizedSheet.tests.find((component) => component.id === normalizedSheet.activeComponentId) || normalizedSheet.tests[0];
}

/* ---------- src/render.js ---------- */

/* ============================================================
   RENDER MODULE (orchestrator)
   Does not own any feature's markup itself — it just decides,
   based on state.view, which module's view function to call, in
   which order. This is the one file every mutation function
   (in patient-module.js, history-module.js) calls after updating
   state, so it is loaded before them but only ever CALLED after
   them, once the page has finished loading.

   Depends on: state.js. Calls renderTabs()/renderEditor()/
   renderSummary() from patient-module.js and renderHistory() from
   history-module.js — those files must be loaded before this one
   runs, though the browser only needs them loaded before the first
   click, not before this file parses.
   ============================================================ */

function renderNav() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === state.view);
  });
}

function render() {
  renderTabs();
  renderNav();
  if (state.view === 'history') {
    renderHistory();
  } else if (state.view === 'templates') {
    renderTemplates();
  } else if (state.view === 'payments') {
    renderPayments();
  } else if (state.view === 'settings') {
    renderSettings();
  } else {
    renderEditor();
  }
  renderSummary();
}

/* ---------- src/patient-module.js ---------- */

/* ============================================================
   PATIENT MODULE
   Everything about a single report sheet: patient details, the
   tabs bar (multiple open sheets), main-test components, subtest
   selection, and the doctor/main-test templates manager. Also
   owns the editor view (renderEditor) since that view is just a
   projection of this module's own data.

   Depends on: utils.js, state.js, render.js (for render()/renderSummary()
   after a mutation — render.js does NOT depend back on this file).
   ============================================================ */

function setActiveSheet(sheetId) {
  state.activeSheetId = sheetId;
  persistState();
  render();
}

function addSheet() {
  const sheet = makeSheet();
  state.sheets.push(sheet);
  state.activeSheetId = sheet.id;
  persistState();
  render();
  showToast('New report sheet created');
}

function closeSheet(sheetId) {
  if (state.sheets.length === 1) return;
  state.sheets = state.sheets.filter((sheet) => sheet.id !== sheetId);
  if (state.activeSheetId === sheetId) {
    state.activeSheetId = state.sheets[0].id;
  }
  persistState();
  render();
}

function updateSheetField(sheetId, path, value) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const parts = path.split('.');
  let current = sheet;
  parts.slice(0, -1).forEach((part) => {
    current = current[part];
  });
  current[parts[parts.length - 1]] = value;
  persistState();
}

function updateTestValue(sheetId, componentId, testId, value) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const component = sheet.tests.find((item) => item.id === componentId);
  const test = component?.tests.find((item) => item.id === testId);
  if (!test) return;
  test.value = value;
  if (component) recalculateFormulas(component);
  persistState();
}

function selectComponent(sheetId, componentId) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  sheet.activeComponentId = componentId;
  const component = sheet.tests.find((item) => item.id === componentId);
  const template = getTemplateById(sheet.templateId);
  if (component) {
    const section = template.sections.find((item) => item.id.toLowerCase() === component.name.toLowerCase() || item.name.toLowerCase() === component.name.toLowerCase());
    if (section) {
      state.activeSectionId = section.id;
      if (!Array.isArray(component.tests) || component.tests.length === 0) {
        component.tests = getDefaultTestsForComponentName(component.name, template);
      }
    }
  }
  persistState();
  render();
}

function cloneTestDefinitionForSheet(testDefinition) {
  return {
    id: testDefinition.id,
    name: testDefinition.name,
    unit: testDefinition.unit,
    referenceRange: testDefinition.referenceRange,
    options: Array.isArray(testDefinition.options) ? testDefinition.options.slice() : undefined,
    abnormalOptions: Array.isArray(testDefinition.abnormalOptions) ? testDefinition.abnormalOptions.slice() : undefined,
    criticalLow: testDefinition.criticalLow,
    criticalHigh: testDefinition.criticalHigh,
    criticalOptions: Array.isArray(testDefinition.criticalOptions) ? testDefinition.criticalOptions.slice() : undefined,
    formula: testDefinition.formula || undefined,
    value: ''
  };
}

function toggleTestSelection(sheetId, sectionId, testId) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const template = getTemplateById(sheet.templateId);
  const section = template.sections.find((item) => item.id === sectionId);
  const testDefinition = section?.tests.find((item) => item.id === testId);
  if (!testDefinition) return;

  const component = sheet.tests.find((item) => item.id === sheet.activeComponentId) || sheet.tests[0];
  if (!component) {
    const newComponent = makeComponent(template.mainTests[0] || 'CBC');
    sheet.tests.push(newComponent);
    sheet.activeComponentId = newComponent.id;
  }

  const activeComponent = sheet.tests.find((item) => item.id === sheet.activeComponentId) || sheet.tests[0];
  const existing = activeComponent.tests.find((item) => item.id === testId);
  if (existing) {
    activeComponent.tests = activeComponent.tests.filter((item) => item.id !== testId);
  } else {
    activeComponent.tests.push(cloneTestDefinitionForSheet(testDefinition));
  }

  persistState();
  render();
}

function toggleAllTestsInSection(sheetId, sectionId, selectAll) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const template = getTemplateById(sheet.templateId);
  const section = template.sections.find((item) => item.id === sectionId);
  if (!section) return;

  const component = sheet.tests.find((item) => item.id === sheet.activeComponentId) || sheet.tests[0];
  if (!component) {
    const newComponent = makeComponent(template.mainTests[0] || 'CBC');
    sheet.tests.push(newComponent);
    sheet.activeComponentId = newComponent.id;
  }

  const activeComponent = sheet.tests.find((item) => item.id === sheet.activeComponentId) || sheet.tests[0];
  const sectionTestIds = new Set(section.tests.map((test) => test.id));

  if (selectAll) {
    section.tests.forEach((testDefinition) => {
      const alreadyPresent = activeComponent.tests.some((item) => item.id === testDefinition.id);
      if (!alreadyPresent) {
        activeComponent.tests.push(cloneTestDefinitionForSheet(testDefinition));
      }
    });
  } else {
    activeComponent.tests = activeComponent.tests.filter((item) => !sectionTestIds.has(item.id));
  }

  persistState();
  render();
}

function moveComponent(sheetId, index, direction) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet || index < 0 || index >= sheet.tests.length) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= sheet.tests.length) return;
  const [moved] = sheet.tests.splice(index, 1);
  sheet.tests.splice(targetIndex, 0, moved);
  persistState();
  render();
}

function removeComponent(sheetId, componentId) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  sheet.tests = sheet.tests.filter((component) => component.id !== componentId);
  if (!sheet.tests.length) {
    sheet.tests = [makeComponent('CBC')];
  }
  if (sheet.activeComponentId === componentId) {
    sheet.activeComponentId = sheet.tests[0].id;
  }
  persistState();
  render();
}

function removeTestFromComponent(sheetId, componentId, testId) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;
  const component = sheet.tests.find((item) => item.id === componentId);
  if (!component) return;
  component.tests = component.tests.filter((test) => test.id !== testId);
  persistState();
  render();
}

function addDoctorToTemplate() {
  const template = getActiveTemplate();
  const doctorName = document.getElementById('doctorNameInput')?.value?.trim();
  if (!doctorName) {
    showToast('Enter a doctor name first');
    return;
  }
  const normalized = normalizeDoctorName(doctorName);
  if (!template.doctors.includes(normalized)) {
    template.doctors.push(normalized);
  }
  const activeSheet = getActiveSheet();
  updateSheetField(activeSheet.id, 'patient.doctor', normalized);
  persistState();
  render();
  showToast(`Doctor added: ${normalized}`);
}

/* ----------------------------------------------------------------
   Dynamic Template Builder
   Lets the user create their own sections and tests — same shape
   as the built-in catalog, just authored through the UI instead of
   hard-coded. Everything created here immediately shows up in the
   "Test sections" picker above, because both read from the same
   template.sections array.
   ---------------------------------------------------------------- */

function createSection(name) {
  const template = getActiveTemplate();
  const trimmed = (name || '').trim();
  if (!trimmed) {
    showToast('Enter a section name first');
    return;
  }
  const section = { id: createId(), name: trimmed, tests: [] };
  template.sections.push(section);
  state.activeSectionId = section.id;
  state.builderEditingTestId = null;
  persistState();
  render();
  showToast(`Section created: ${trimmed}`);
}

function renameSection(sectionId, newName) {
  const template = getActiveTemplate();
  const section = template.sections.find((item) => item.id === sectionId);
  const trimmed = (newName || '').trim();
  if (!section || !trimmed) {
    showToast('Enter a section name first');
    return;
  }
  section.name = trimmed;
  persistState();
  render();
  showToast('Section renamed');
}

function deleteSection(sectionId) {
  const template = getActiveTemplate();
  if (template.sections.length <= 1) {
    showToast('You need at least one section');
    return;
  }
  template.sections = template.sections.filter((item) => item.id !== sectionId);
  if (state.activeSectionId === sectionId) {
    state.activeSectionId = template.sections[0].id;
  }
  state.builderEditingTestId = null;
  persistState();
  render();
  showToast('Section deleted');
}

function startEditTemplateTest(testId) {
  state.builderEditingTestId = testId;
  render();
}

function cancelEditTemplateTest() {
  state.builderEditingTestId = null;
  render();
}

function updateStylePreview() {
  const preview = document.getElementById('stylePreview');
  if (!preview) return;

  const fontSize = document.getElementById('builderTestFontSize')?.value || 'medium';
  const alignment = document.getElementById('builderTestAlignment')?.value || 'left';
  const bold = document.getElementById('builderTestBold')?.classList.contains('active') || false;
  const italic = document.getElementById('builderTestItalic')?.classList.contains('active') || false;

  const fontSizeMap = { small: '12px', medium: '14px', large: '16px', xlarge: '18px' };
  
  preview.style.fontSize = fontSizeMap[fontSize] || '14px';
  preview.style.textAlign = alignment;
  preview.style.fontWeight = bold ? 'bold' : 'normal';
  preview.style.fontStyle = italic ? 'italic' : 'normal';
}

function readBuilderForm() {
  const name = document.getElementById('builderTestName')?.value?.trim() || '';
  const unit = document.getElementById('builderTestUnit')?.value?.trim() || '';
  const defaultRange = document.getElementById('builderTestRange')?.value?.trim() || '';
  const maleRange = document.getElementById('builderTestRangeMale')?.value?.trim() || '';
  const femaleRange = document.getElementById('builderTestRangeFemale')?.value?.trim() || '';
  const optionsRaw = document.getElementById('builderTestOptions')?.value?.trim() || '';
  const abnormalRaw = document.getElementById('builderTestAbnormalOptions')?.value?.trim() || '';
  const criticalLowRaw = document.getElementById('builderTestCriticalLow')?.value?.trim() || '';
  const criticalHighRaw = document.getElementById('builderTestCriticalHigh')?.value?.trim() || '';
  const criticalOptionsRaw = document.getElementById('builderTestCriticalOptions')?.value?.trim() || '';
  const formula = document.getElementById('builderTestFormula')?.value?.trim() || '';

  let referenceRange = defaultRange;
  if (maleRange || femaleRange) {
    referenceRange = `M: ${maleRange || defaultRange || '—'} | F: ${femaleRange || defaultRange || '—'}`;
  }

  const options = optionsRaw ? optionsRaw.split(',').map((item) => item.trim()).filter(Boolean) : [];
  const abnormalOptions = abnormalRaw ? abnormalRaw.split(',').map((item) => item.trim()).filter(Boolean) : [];
  const criticalOptions = criticalOptionsRaw ? criticalOptionsRaw.split(',').map((item) => item.trim()).filter(Boolean) : [];
  const criticalLow = criticalLowRaw !== '' ? parseFloat(criticalLowRaw) : undefined;
  const criticalHigh = criticalHighRaw !== '' ? parseFloat(criticalHighRaw) : undefined;

  const isHeading = document.getElementById('builderTestIsHeading')?.value === 'true';
  const fontSize = document.getElementById('builderTestFontSize')?.value || 'medium';
  const alignment = document.getElementById('builderTestAlignment')?.value || 'left';
  const bold = document.getElementById('builderTestBold')?.classList.contains('active') || false;
  const italic = document.getElementById('builderTestItalic')?.classList.contains('active') || false;

  return { 
    name, 
    unit, 
    referenceRange, 
    options, 
    abnormalOptions,
    criticalLow,
    criticalHigh,
    criticalOptions,
    formula,
    style: { isHeading, fontSize, alignment, bold, italic }
  };
}

function clearBuilderForm() {
  ['builderTestName', 'builderTestUnit', 'builderTestRange', 'builderTestRangeMale', 'builderTestRangeFemale', 'builderTestOptions', 'builderTestAbnormalOptions', 'builderTestCriticalLow', 'builderTestCriticalHigh', 'builderTestCriticalOptions', 'builderTestFormula', 'builderTestIsHeading', 'builderTestFontSize', 'builderTestAlignment'].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  const boldBtn = document.getElementById('builderTestBold');
  const italicBtn = document.getElementById('builderTestItalic');
  if (boldBtn) boldBtn.classList.remove('active');
  if (italicBtn) italicBtn.classList.remove('active');
}

function saveTemplateTest(sectionId) {
  const template = getActiveTemplate();
  const section = template.sections.find((item) => item.id === sectionId);
  if (!section) return;

  const form = readBuilderForm();
  if (!form.name) {
    showToast('Enter a test name first');
    return;
  }

  // Reference range is intentionally optional — tests like HIV or Blood
  // Group don't have one. An empty value is stored as '' and simply
  // isn't shown anywhere; it never causes an error.
  const payload = {
    name: form.name,
    unit: form.unit,
    referenceRange: form.referenceRange,
    options: form.options.length ? form.options : undefined,
    abnormalOptions: form.abnormalOptions.length ? form.abnormalOptions : undefined,
    criticalLow: form.criticalLow,
    criticalHigh: form.criticalHigh,
    criticalOptions: form.criticalOptions.length ? form.criticalOptions : undefined,
    formula: form.formula || undefined,
    style: form.style
  };

  if (state.builderEditingTestId) {
    const existing = section.tests.find((item) => item.id === state.builderEditingTestId);
    if (existing) {
      Object.assign(existing, payload);
      if (!payload.options) delete existing.options;
      if (!payload.abnormalOptions) delete existing.abnormalOptions;
      if (payload.criticalLow === undefined) delete existing.criticalLow;
      if (payload.criticalHigh === undefined) delete existing.criticalHigh;
      if (!payload.criticalOptions) delete existing.criticalOptions;
      if (!payload.formula) delete existing.formula;
      showToast(`${form.name} updated`);
    }
    state.builderEditingTestId = null;
  } else {
    section.tests.push({ id: createId(), ...payload });
    showToast(`${form.name} added to ${section.name}`);
  }

  clearBuilderForm();
  persistState();
  render();
}

function deleteTemplateTest(sectionId, testId) {
  const template = getActiveTemplate();
  const section = template.sections.find((item) => item.id === sectionId);
  if (!section) return;
  section.tests = section.tests.filter((item) => item.id !== testId);
  if (state.builderEditingTestId === testId) {
    state.builderEditingTestId = null;
  }
  persistState();
  render();
  showToast('Test removed from template');
}

function bulkAddTemplateTests(sectionId) {
  const template = getActiveTemplate();
  const section = template.sections.find((item) => item.id === sectionId);
  const textarea = document.getElementById('bulkTestInput');
  const raw = textarea?.value || '';
  if (!section) return;

  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  if (!lines.length) {
    showToast('Paste at least one test line first');
    return;
  }

  let addedCount = 0;
  lines.forEach((line) => {
    const [namePart, unitPart, rangePart, optionsPart] = line.split('|').map((part) => (part || '').trim());
    if (!namePart) return;
    const options = optionsPart ? optionsPart.split(',').map((item) => item.trim()).filter(Boolean) : undefined;
    section.tests.push({
      id: createId(),
      name: namePart,
      unit: unitPart || '',
      referenceRange: rangePart || '',
      options
    });
    addedCount += 1;
  });

  if (!addedCount) {
    showToast('Could not find any valid test names in that list');
    return;
  }

  if (textarea) textarea.value = '';
  persistState();
  render();
  showToast(`${addedCount} test${addedCount === 1 ? '' : 's'} added to ${section.name}`);
}

function renderTabs() {
  const tabBar = document.getElementById('tabBar');
  tabBar.innerHTML = '';

  state.sheets.forEach((sheet, index) => {
    const tabLabel = sheet.patient.name || `Report ${index + 1}`;
    const button = document.createElement('button');
    button.className = `tab-btn ${sheet.id === state.activeSheetId ? 'active' : ''}`;
    button.innerHTML = `<span>${escapeHtml(tabLabel)}</span><button class="close" data-close-sheet="${sheet.id}" aria-label="Close">×</button>`;
    button.addEventListener('click', (event) => {
      if (event.target.closest('[data-close-sheet]')) return;
      setActiveSheet(sheet.id);
    });
    tabBar.appendChild(button);
  });

  const addButton = document.createElement('button');
  addButton.className = 'add-tab-btn';
  addButton.textContent = '+ New sheet';
  addButton.addEventListener('click', addSheet);
  tabBar.appendChild(addButton);
}

function splitGenderRangeForEditing(rangeText) {
  if (!rangeText) return { default: '', male: '', female: '' };
  const hasMale = /\bM\s*:/i.test(rangeText);
  const hasFemale = /\bF\s*:/i.test(rangeText);
  if (!hasMale || !hasFemale) return { default: rangeText, male: '', female: '' };

  const parts = rangeText.split('|').map((part) => part.trim());
  const male = (parts.find((part) => /^M\s*:/i.test(part)) || '').replace(/^M\s*:\s*/i, '');
  const female = (parts.find((part) => /^F\s*:/i.test(part)) || '').replace(/^F\s*:\s*/i, '');
  return { default: '', male: male === '—' ? '' : male, female: female === '—' ? '' : female };
}

function renderTemplates() {
  const editor = document.getElementById('editorContent');
  const template = getActiveTemplate();
  const currentSection = getCurrentSection(template);
  const editingTest = state.builderEditingTestId ? currentSection.tests.find((test) => test.id === state.builderEditingTestId) : null;
  const editingTestRangeParts = splitGenderRangeForEditing(editingTest?.referenceRange);
  const editingTestStyle = editingTest?.style || { isHeading: false, fontSize: 'medium', alignment: 'left', bold: false, italic: false };
  editor.innerHTML = `
    <div class="editor-stack">
      <div class="panel-card">
        <div class="panel-title-row">
          <div>
            <h2>Templates</h2>
            <p class="muted-text">Build reusable report sections and tests with custom styling.</p>
          </div>
          <span class="badge">${escapeHtml(template.name)}</span>
        </div>
        <div class="template-column">
          <div class="field-group">
            <label>Sections</label>
            <div class="muted-text" style="margin-bottom:8px;">Editing: <strong>${escapeHtml(currentSection.name)}</strong></div>
            <div class="inline-actions">
              <input id="renameSectionInput" placeholder="Rename this section" value="${escapeHtml(currentSection.name)}" />
              <button class="ghost-btn" data-rename-section="${currentSection.id}">Rename</button>
              <button class="ghost-btn" data-delete-section="${currentSection.id}">Delete</button>
            </div>
            <div class="inline-actions" style="margin-top:10px;">
              <input id="newSectionInput" placeholder="New section name" />
              <button class="primary-btn" data-create-section>Create section</button>
            </div>
          </div>
        </div>
        <div class="section-tabs" style="margin-top:16px;">
          ${template.sections.map((section) => `<button class="section-tab ${section.id === currentSection.id ? 'active' : ''}" data-select-section="${section.id}">${escapeHtml(section.name)}</button>`).join('')}
        </div>
        <div class="field-group" style="margin-top:18px;">
          <label>${editingTest ? `Editing "${escapeHtml(editingTest.name)}"` : `Add a test to ${escapeHtml(currentSection.name)}`}</label>
          <div class="form-grid">
            <div class="field-group"><label>Test name</label><input id="builderTestName" placeholder="e.g. Serum Ferritin or Hematology (heading)" value="${escapeHtml(editingTest?.name || '')}" /></div>
            <div class="field-group"><label>Unit</label><input id="builderTestUnit" placeholder="e.g. ng/mL" value="${escapeHtml(editingTest?.unit || '')}" /></div>
            <div class="field-group"><label>Reference range</label><input id="builderTestRange" placeholder="e.g. 80 - 140 mg/dl" value="${escapeHtml(editingTestRangeParts.default)}" /></div>
            <div class="field-group"><label>Options (comma separated)</label><input id="builderTestOptions" placeholder="e.g. Negative, Positive" value="${escapeHtml((editingTest?.options || []).join(', '))}" /></div>
            <div class="field-group"><label>Male-specific range</label><input id="builderTestRangeMale" placeholder="Optional" value="${escapeHtml(editingTestRangeParts.male)}" /></div>
            <div class="field-group"><label>Female-specific range</label><input id="builderTestRangeFemale" placeholder="Optional" value="${escapeHtml(editingTestRangeParts.female)}" /></div>
            <div class="field-group"><label>Abnormal options (comma separated)</label><input id="builderTestAbnormalOptions" placeholder="e.g. Reactive, Positive" value="${escapeHtml((editingTest?.abnormalOptions || []).join(', '))}" /></div>
            <div class="field-group"><label>Critical low (optional)</label><input id="builderTestCriticalLow" type="number" step="any" placeholder="e.g. 40" value="${editingTest?.criticalLow !== undefined ? editingTest.criticalLow : ''}" /></div>
            <div class="field-group"><label>Critical high (optional)</label><input id="builderTestCriticalHigh" type="number" step="any" placeholder="e.g. 500" value="${editingTest?.criticalHigh !== undefined ? editingTest.criticalHigh : ''}" /></div>
            <div class="field-group"><label>Critical options (comma separated)</label><input id="builderTestCriticalOptions" placeholder="e.g. Reactive" value="${escapeHtml((editingTest?.criticalOptions || []).join(', '))}" /></div>
            <div class="field-group" style="grid-column: 1 / -1;"><label>Formula (optional — auto-calculates this value from other tests)</label><input id="builderTestFormula" placeholder="e.g. {triglycerides} / 5  or  {total-cholesterol} / {hdl-cholesterol}" value="${escapeHtml(editingTest?.formula || '')}" /></div>
            <p class="muted-text" style="grid-column: 1 / -1; font-size: 0.8rem; margin: -4px 0 0;">Wrap another test's ID in curly braces to reference its value, e.g. <code>{triglycerides} / 5</code> for VLDL, or <code>{total-cholesterol} / {hdl-cholesterol}</code> for a ratio. Available IDs in "${escapeHtml(currentSection.name)}": ${currentSection.tests.map((t) => `<code>${escapeHtml(t.id)}</code>`).join(', ') || 'none yet'}. Leave blank for a normal, manually-entered test.</p>
            <p class="muted-text" style="grid-column: 1 / -1; font-size: 0.8rem; margin: -4px 0 0;">Leave the critical fields blank if this test has no panic value. Set them only when your lab wants staff alerted immediately for values beyond the normal reference range.</p>
          </div>
          <div style="margin-top:16px; padding:16px; background:var(--panel-strong); border-radius:10px;">
            <div style="font-weight:700; margin-bottom:12px; color:var(--text);">Text Styling</div>
            <div class="form-grid" style="gap:8px;">
              <div class="field-group"><label>Style type</label><select id="builderTestIsHeading"><option value="false" ${editingTestStyle.isHeading === false ? 'selected' : ''}>Normal test</option><option value="true" ${editingTestStyle.isHeading === true ? 'selected' : ''}>Section heading</option></select></div>
              <div class="field-group"><label>Font size</label><select id="builderTestFontSize"><option value="small" ${editingTestStyle.fontSize === 'small' ? 'selected' : ''}>Small (12px)</option><option value="medium" ${editingTestStyle.fontSize === 'medium' ? 'selected' : ''}>Medium (14px)</option><option value="large" ${editingTestStyle.fontSize === 'large' ? 'selected' : ''}>Large (16px)</option><option value="xlarge" ${editingTestStyle.fontSize === 'xlarge' ? 'selected' : ''}>Extra Large (18px)</option></select></div>
              <div class="field-group"><label>Alignment</label><select id="builderTestAlignment"><option value="left" ${editingTestStyle.alignment === 'left' ? 'selected' : ''}>Left</option><option value="center" ${editingTestStyle.alignment === 'center' ? 'selected' : ''}>Center</option><option value="right" ${editingTestStyle.alignment === 'right' ? 'selected' : ''}>Right</option></select></div>
            </div>
            <div class="inline-actions" style="margin-top:10px; gap:8px;">
              <button class="secondary-btn ${editingTestStyle.bold ? 'active' : ''}" id="builderTestBold" data-toggle="bold" style="font-weight:700;"><strong>B</strong> Bold</button>
              <button class="secondary-btn ${editingTestStyle.italic ? 'active' : ''}" id="builderTestItalic" data-toggle="italic" style="font-style:italic;"><em>I</em> Italic</button>
            </div>
            <div class="muted-text" style="margin-top:10px; font-size:0.8rem;">Preview: <span id="stylePreview" style="font-size:${editingTestStyle.fontSize === 'small' ? '12px' : editingTestStyle.fontSize === 'large' ? '16px' : editingTestStyle.fontSize === 'xlarge' ? '18px' : '14px'}; text-align:${editingTestStyle.alignment}; font-weight:${editingTestStyle.bold ? 'bold' : 'normal'}; font-style:${editingTestStyle.italic ? 'italic' : 'normal'};">${editingTest ? escapeHtml(editingTest.name) : 'Preview text'}</span></div>
          </div>
          <div class="inline-actions" style="margin-top:16px;"><button class="primary-btn" data-save-template-test="${currentSection.id}">${editingTest ? 'Update test' : 'Add test'}</button>${editingTest ? '<button class="ghost-btn" data-cancel-edit-test>Cancel</button>' : ''}</div>
        </div>
        <details class="bulk-add-details" style="margin-top:16px;"><summary>Add several subtests at once</summary><div class="field-group" style="margin-top:10px;"><label>One test per line: Name | Unit | Reference range | Options</label><textarea id="bulkTestInput" rows="5" placeholder="RBC | millions/cumm | 4.0 - 6.0"></textarea><div class="inline-actions" style="margin-top:8px;"><button class="primary-btn" data-bulk-add-tests="${currentSection.id}">Add all lines</button></div></div></details>
        <div class="component-list" style="margin-top:16px;">
          ${currentSection.tests.length ? currentSection.tests.map((test) => {
            const testStyle = test.style || { isHeading: false, fontSize: 'medium', alignment: 'left', bold: false, italic: false };
            const fontSize = testStyle.fontSize === 'small' ? '12px' : testStyle.fontSize === 'large' ? '16px' : testStyle.fontSize === 'xlarge' ? '18px' : '14px';
            const styleTag = testStyle.isHeading ? '<span style="background:var(--primary-soft); color:var(--primary); padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:700;">HEADING</span>' : '';
            return `<div class="component-card ${test.id === state.builderEditingTestId ? 'active' : ''}"><div class="component-card-header"><div><strong style="font-size:${fontSize}; font-weight:${testStyle.bold ? 'bold' : 'normal'}; font-style:${testStyle.italic ? 'italic' : 'normal'}; display:block;">${escapeHtml(test.name)}</strong>${styleTag}<div class="muted-text" style="margin-top:4px;">${escapeHtml(test.unit || '—')} ${test.referenceRange ? `· ${escapeHtml(test.referenceRange)}` : '· no reference range'}</div></div><div class="inline-actions"><button class="ghost-btn" data-edit-template-test="${test.id}">Edit</button><button class="ghost-btn" data-delete-template-test="${currentSection.id}" data-test-id="${test.id}">Delete</button></div></div></div>`;
          }).join('') : '<div class="muted-text">No tests in this section yet.</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderEditor() {
  const activeSheet = getActiveSheet();
  if (!activeSheet) {
    document.getElementById('editorContent').innerHTML = '<p class="muted-text">No report sheet available.</p>';
    return;
  }

  activeSheet.tests.forEach((component) => recalculateFormulas(component));

  const editor = document.getElementById('editorContent');
  const template = getActiveTemplate();
  const currentSection = getCurrentSection(template);
  const activeComponent = getActiveComponent(activeSheet);
  const selectedTestIds = new Set(activeComponent?.tests.map((test) => test.id) || []);
  const doctorValue = activeSheet.patient.doctor || normalizeDoctorName(template.doctors[0]);

  editor.innerHTML = `
    <div class="editor-stack">
      <div class="panel-card">
        <div class="panel-title-row">
          <div>
            <h2>Report setup</h2>
            <p class="muted-text">Enter patient details and select tests from the active template.</p>
          </div>
          <span class="badge">${escapeHtml(template.name)}</span>
        </div>

        <div class="form-grid">
          <div class="field-group">
            <label>Patient Name</label>
            <input data-field="patient.name" value="${escapeHtml(activeSheet.patient.name)}" />
          </div>
          <div class="field-group">
            <label>Doctor</label>
            <div class="doctor-stack">
              <input data-field="patient.doctor" value="${escapeHtml(doctorValue)}" />
              <select data-doctor-select>
                ${template.doctors.map((doctor) => `<option value="${escapeHtml(doctor)}" ${doctor === activeSheet.patient.doctor ? 'selected' : ''}>${escapeHtml(doctor)}</option>`).join('')}
              </select>
            </div>
            <div class="inline-actions">
              <input id="doctorNameInput" placeholder="Add doctor" />
              <button class="ghost-btn" data-add-doctor>Add</button>
            </div>
          </div>
          <div class="field-group">
            <label>Age</label>
            <input data-field="patient.age" value="${escapeHtml(activeSheet.patient.age)}" />
          </div>
          <div class="field-group">
            <label>Gender</label>
            <div class="gender-toggle">
              <button class="gender-pill ${activeSheet.patient.gender === 'M' ? 'active' : ''}" data-gender="M">M</button>
              <button class="gender-pill ${activeSheet.patient.gender === 'F' ? 'active' : ''}" data-gender="F">F</button>
            </div>
          </div>
          <div class="field-group">
            <label>Amount Paid</label>
            <input type="number" min="0" step="0.01" data-field="patient.amountPaid" value="${escapeHtml(activeSheet.patient.amountPaid || '')}" />
          </div>
          <div class="field-group">
            <label>Report Date</label>
            <input type="date" data-field="patient.date" value="${escapeHtml(activeSheet.patient.date)}" />
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-title-row">
          <div>
            <h3>Test sections</h3>
            <p class="muted-text">Select tests defined in the active template.</p>
          </div>
          <span class="badge">${activeSheet.tests.length} components</span>
        </div>

        <div class="component-toolbar">
          <select data-select-component aria-label="Active test group">
            ${activeSheet.tests.map((component) => `<option value="${component.id}" ${component.id === activeSheet.activeComponentId ? 'selected' : ''}>${escapeHtml(component.name)}</option>`).join('')}
          </select>
        </div>

        <div class="section-tabs">
          ${template.sections.map((section) => `
            <button class="section-tab ${section.id === currentSection.id ? 'active' : ''}" data-select-section="${section.id}">
              ${escapeHtml(section.name)}
            </button>
          `).join('')}
        </div>

        <div class="test-grid-header">
          <label class="select-all-tests">
            <input type="checkbox" data-toggle-all-tests="${currentSection.id}" ${currentSection.tests.length && currentSection.tests.every((test) => selectedTestIds.has(test.id)) ? 'checked' : ''} />
            Select all tests in this section
          </label>
        </div>
        <div class="test-grid">
          ${currentSection.tests.map((test) => `
            <button class="test-chip ${selectedTestIds.has(test.id) ? 'active' : ''}" data-toggle-test="${test.id}" data-section="${currentSection.id}">
              <strong>${escapeHtml(test.name)}</strong>
              <span>${escapeHtml(test.unit || (test.options ? test.options.join(' / ') : '—'))}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-title-row">
          <div>
            <h3>Component preview</h3>
            <p class="muted-text">Each main test can be moved as a whole and holds its own subtests.</p>
          </div>
        </div>

        <div class="component-list">
          ${activeSheet.tests.map((component, index) => `
            <div class="component-card ${component.id === activeSheet.activeComponentId ? 'active' : ''}">
              <div class="component-card-header">
                <div>
                  <strong>${escapeHtml(component.name)}</strong>
                  <div class="muted-text">${component.tests.length} subtests</div>
                </div>
                <div class="inline-actions">
                  <button class="ghost-btn" data-move-component="${index}" data-direction="-1">↑</button>
                  <button class="ghost-btn" data-move-component="${index}" data-direction="1">↓</button>
                  <button class="ghost-btn" data-remove-component="${component.id}">×</button>
                </div>
              </div>
              <div class="component-subtest-list">
                ${component.tests.length ? component.tests.map((test) => {
                  const abnormal = isAbnormalResult(test, activeSheet.patient.gender);
                  const critical = isCriticalResult(test, activeSheet.patient.gender);
                  const testStyle = test.style || { isHeading: false, fontSize: 'medium', alignment: 'left', bold: false, italic: false };
                  const fontSizeMap = { small: '12px', medium: '14px', large: '16px', xlarge: '18px' };
                  const fontSize = fontSizeMap[testStyle.fontSize] || '14px';
                  const styleStr = `font-size:${fontSize}; text-align:${testStyle.alignment}; font-weight:${testStyle.bold ? 'bold' : 'normal'}; font-style:${testStyle.italic ? 'italic' : 'normal'};${testStyle.isHeading ? ' margin-top:12px; padding-top:8px; border-top:2px solid #e7eef8;' : ''}`;
                  const valueClass = critical ? 'value-critical' : (abnormal ? 'value-abnormal' : '');
                  const valueField = test.formula
                    ? `<input data-test-id="${test.id}" value="${escapeHtml(test.value || '—')}" class="${valueClass} value-computed" readonly title="Auto-calculated from ${escapeHtml(test.formula)}" />`
                    : test.options && test.options.length
                    ? `<select data-test-value="${component.id}" data-test-id="${test.id}" class="${valueClass}">
                        <option value="" ${!test.value ? 'selected' : ''}>—</option>
                        ${test.options.map((option) => `<option value="${escapeHtml(option)}" ${test.value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
                      </select>`
                    : `<input data-test-value="${component.id}" data-test-id="${test.id}" value="${escapeHtml(test.value)}" class="${valueClass}" />`;
                  return `
                  <div class="component-subtest" ${testStyle.isHeading ? 'style="font-weight:700;"' : ''}>
                    <div>
                      <strong style="${styleStr}">${escapeHtml(test.name)}</strong>
                      <div class="muted-text">${escapeHtml(test.referenceRange || (test.options ? '' : test.unit) || '—')} ${test.formula ? '<span class="computed-badge">Auto-calculated</span>' : ''}${critical ? '<span class="critical-badge">⚠ Critical value</span>' : (abnormal ? '<span class="abnormal-badge">Outside range</span>' : '')}</div>
                    </div>
                    <div class="inline-actions">
                      ${valueField}
                      <button class="ghost-btn" data-remove-test="${component.id}" data-test-id="${test.id}">×</button>
                    </div>
                  </div>
                `;
                }).join('') : '<div class="muted-text">No subtests selected yet.</div>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSummary() {
  const activeSheet = getActiveSheet();
  const summary = document.getElementById('summaryContent');
  const totalTests = activeSheet.tests.reduce((sum, component) => sum + component.tests.length, 0);
  const completed = activeSheet.tests.reduce((sum, component) => sum + component.tests.filter((test) => test.value.trim() !== '').length, 0);

  const criticalTests = [];
  activeSheet.tests.forEach((component) => {
    component.tests.forEach((test) => {
      if (isCriticalResult(test, activeSheet.patient.gender)) {
        criticalTests.push(test);
      }
    });
  });

  summary.innerHTML = `
    ${criticalTests.length ? `
      <div class="critical-alert-box">
        <strong>⚠ ${criticalTests.length} critical value${criticalTests.length > 1 ? 's' : ''} — notify the doctor</strong>
        <ul>${criticalTests.map((test) => `<li>${escapeHtml(test.name)}: <strong>${escapeHtml(test.value)}</strong></li>`).join('')}</ul>
      </div>
    ` : ''}
    <div class="summary-list">
      <div class="summary-row"><span>Sheet</span><strong>${escapeHtml(activeSheet.patient.name || `Report ${state.sheets.indexOf(activeSheet) + 1}`)}</strong></div>
      <div class="summary-row"><span>Patient</span><strong>${escapeHtml(activeSheet.patient.name || 'Pending')}</strong></div>
      <div class="summary-row"><span>Doctor</span><strong>${escapeHtml(activeSheet.patient.doctor || 'Pending')}</strong></div>
      <div class="summary-row"><span>Components</span><strong>${activeSheet.tests.length}</strong></div>
      <div class="summary-row"><span>Subtests</span><strong>${completed}/${totalTests}</strong></div>
      <div class="summary-row"><span>Status</span><strong>${totalTests === 0 ? 'No tests selected' : completed === totalTests ? 'Ready' : 'In progress'}</strong></div>
    </div>
  `;
}

/* ---------- src/history-module.js ---------- */

/* ============================================================
   HISTORY MODULE
   Saved-report snapshots. Reads the active sheet from the Patient
   module's data (via state.js getters) but owns its own storage
   array (state.history), its own mutation logic, and its own view.

   Depends on: utils.js, state.js, render.js (for render() after a
   mutation). Also called FROM print-module.js when printing
   (printing a report auto-saves it to history), and from app.js's
   click dispatcher.
   ============================================================ */

function saveActiveSheetToHistory() {
  const activeSheet = getActiveSheet();
  const template = getActiveTemplate();
  const totalTests = activeSheet.tests.reduce((sum, component) => sum + component.tests.length, 0);
  if (totalTests === 0) {
    showToast('Add at least one test before saving to history');
    return null;
  }

  const snapshot = {
    historyId: activeSheet.id,
    sheetId: activeSheet.id,
    savedAt: new Date().toISOString(),
    templateName: template.name,
    patient: JSON.parse(JSON.stringify(activeSheet.patient)),
    tests: JSON.parse(JSON.stringify(activeSheet.tests))
  };

  const existingIndex = state.history.findIndex((entry) => entry.historyId === snapshot.historyId);
  if (existingIndex >= 0) {
    state.history[existingIndex] = snapshot;
  } else {
    state.history.unshift(snapshot);
  }
  persistState();
  return snapshot;
}

function deleteHistoryEntry(historyId) {
  state.history = state.history.filter((entry) => entry.historyId !== historyId);
  persistState();
  render();
  showToast('Removed from history');
}

function reopenHistoryEntryAsSheet(historyId) {
  const entry = state.history.find((item) => item.historyId === historyId);
  if (!entry) return;

  const existingSheet = state.sheets.find((sheet) => sheet.id === entry.sheetId);
  if (existingSheet) {
    state.activeSheetId = existingSheet.id;
  } else {
    const template = getTemplateById(state.templates.find((t) => t.name === entry.templateName)?.id || 'core-lab');
    const newSheet = {
      id: entry.sheetId,
      patient: JSON.parse(JSON.stringify(entry.patient)),
      templateId: template.id,
      activeComponentId: entry.tests[0]?.id,
      tests: JSON.parse(JSON.stringify(entry.tests))
    };
    state.sheets.push(normalizeSheet(newSheet));
    state.activeSheetId = newSheet.id;
  }
  state.view = 'editor';
  persistState();
  render();
  showToast('Report reopened for editing');
}

function getHistoryFilters() {
  return {
    doctor: document.getElementById('historyDoctorFilter')?.value || 'all',
    search: (document.getElementById('historySearch')?.value || '').trim().toLowerCase(),
    from: document.getElementById('historyFromDate')?.value || '',
    to: document.getElementById('historyToDate')?.value || ''
  };
}

function getFilteredHistory() {
  const filters = getHistoryFilters();
  return state.history.filter((entry) => {
    const patient = entry.patient || {};
    const doctor = patient.doctor || 'Unassigned';
    const name = patient.name || 'Unnamed patient';
    const date = patient.date || entry.savedAt?.slice(0, 10) || '';
    const matchesDoctor = filters.doctor === 'all' || doctor === filters.doctor;
    const matchesSearch = !filters.search || `${name} ${doctor} ${entry.templateName || ''}`.toLowerCase().includes(filters.search);
    const matchesFrom = !filters.from || date >= filters.from;
    const matchesTo = !filters.to || date <= filters.to;
    return matchesDoctor && matchesSearch && matchesFrom && matchesTo;
  });
}

function renderHistory() {
  const editor = document.getElementById('editorContent');

  if (!state.history.length) {
    editor.innerHTML = `
      <div class="panel-card">
        <div class="panel-title-row">
          <div>
            <h2>Report history</h2>
            <p class="muted-text">Saved reports will appear here once you click Save on a report sheet.</p>
          </div>
        </div>
        <p class="muted-text">No saved reports yet.</p>
      </div>
    `;
    return;
  }

  const doctors = [...new Set(state.history.map((entry) => entry.patient?.doctor).filter(Boolean))].sort();
  const entries = getFilteredHistory();

  editor.innerHTML = `
    <div class="panel-card">
      <div class="panel-title-row">
        <div>
          <h2>Report history</h2>
          <p class="muted-text">Every report you save is kept here so you can reopen or reprint it later.</p>
        </div>
        <span class="badge">${state.history.length} saved</span>
      </div>
      <div class="payment-filters">
        <div class="field-group payment-search"><label>Search patient or doctor</label><input id="historySearch" placeholder="Search reports" value="${escapeHtml(document.getElementById('historySearch')?.value || '')}" /></div>
        <div class="field-group"><label>Reference Doctor</label><select id="historyDoctorFilter"><option value="all">All doctors</option>${doctors.map((doctor) => `<option value="${escapeHtml(doctor)}">${escapeHtml(doctor)}</option>`).join('')}</select></div>
        <div class="field-group"><label>From</label><input type="date" id="historyFromDate" value="${escapeHtml(document.getElementById('historyFromDate')?.value || '')}" /></div>
        <div class="field-group"><label>To</label><input type="date" id="historyToDate" value="${escapeHtml(document.getElementById('historyToDate')?.value || '')}" /></div>
        <button class="ghost-btn payment-clear" data-clear-history-filters>Clear</button>
      </div>
      <div class="component-list">
        ${entries.length ? entries.map((entry) => {
          const totalTests = entry.tests.reduce((sum, component) => sum + component.tests.length, 0);
          return `
            <div class="component-card">
              <div class="component-card-header">
                <div>
                  <strong>${escapeHtml(entry.patient.name || 'Unnamed patient')}</strong>
                  <div class="muted-text">${escapeHtml(entry.templateName)} · ${totalTests} tests · Saved ${formatSavedAt(entry.savedAt)}</div>
                </div>
                <div class="inline-actions">
                  <button class="secondary-btn" data-history-print="${entry.historyId}">Print</button>
                  <button class="ghost-btn" data-history-reopen="${entry.historyId}">Reopen</button>
                  <button class="ghost-btn" data-history-delete="${entry.historyId}">Delete</button>
                </div>
              </div>
            </div>
          `;
        }).join('') : `<p class="muted-text">No reports match these filters.</p>`}
      </div>
    </div>
  `;
  const selectedDoctor = getHistoryFilters().doctor;
  const doctorFilter = document.getElementById('historyDoctorFilter');
  if (doctorFilter) doctorFilter.value = selectedDoctor;
}

function formatCurrency(amount) {
  const value = Number.parseFloat(amount);
  return Number.isFinite(value) ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00';
}

function getPaymentFilters() {
  return {
    doctor: document.getElementById('paymentDoctorFilter')?.value || 'all',
    search: (document.getElementById('paymentSearch')?.value || '').trim().toLowerCase(),
    from: document.getElementById('paymentFromDate')?.value || '',
    to: document.getElementById('paymentToDate')?.value || ''
  };
}

function getFilteredPayments() {
  const filters = getPaymentFilters();
  return state.history.filter((entry) => {
    const patient = entry.patient || {};
    const doctor = patient.doctor || 'Unassigned';
    const name = patient.name || 'Unnamed patient';
    const date = patient.date || entry.savedAt?.slice(0, 10) || '';
    const matchesDoctor = filters.doctor === 'all' || doctor === filters.doctor;
    const matchesSearch = !filters.search || `${name} ${doctor}`.toLowerCase().includes(filters.search);
    const matchesFrom = !filters.from || date >= filters.from;
    const matchesTo = !filters.to || date <= filters.to;
    return matchesDoctor && matchesSearch && matchesFrom && matchesTo;
  });
}

function renderPayments() {
  const editor = document.getElementById('editorContent');
  const doctors = [...new Set(state.history.map((entry) => entry.patient?.doctor).filter(Boolean))].sort();
  const entries = getFilteredPayments();
  const total = entries.reduce((sum, entry) => sum + (Number.parseFloat(entry.patient?.amountPaid) || 0), 0);

  editor.innerHTML = `
    <div class="editor-stack payments-view">
      <div class="panel-card payments-header">
        <div class="panel-title-row">
          <div>
            <h2>Payments</h2>
            <p class="muted-text">Track collected amounts from saved reports.</p>
          </div>
          <button class="primary-btn" data-export-payments>Export PDF</button>
        </div>
        <div class="payment-filters">
          <div class="field-group payment-search"><label>Search patient or doctor</label><input id="paymentSearch" placeholder="Search ledger" value="${escapeHtml(document.getElementById('paymentSearch')?.value || '')}" /></div>
          <div class="field-group"><label>Reference Doctor</label><select id="paymentDoctorFilter"><option value="all">All doctors</option>${doctors.map((doctor) => `<option value="${escapeHtml(doctor)}">${escapeHtml(doctor)}</option>`).join('')}</select></div>
          <div class="field-group"><label>From</label><input type="date" id="paymentFromDate" value="${escapeHtml(document.getElementById('paymentFromDate')?.value || '')}" /></div>
          <div class="field-group"><label>To</label><input type="date" id="paymentToDate" value="${escapeHtml(document.getElementById('paymentToDate')?.value || '')}" /></div>
          <button class="ghost-btn payment-clear" data-clear-payment-filters>Clear</button>
        </div>
      </div>

      <div class="payment-metrics">
        <div class="metric-card"><span>Collected total</span><strong>${formatCurrency(total)}</strong></div>
        <div class="metric-card"><span>Patients</span><strong>${entries.length}</strong></div>
        <div class="metric-card"><span>Average collection</span><strong>${formatCurrency(entries.length ? total / entries.length : 0)}</strong></div>
      </div>

      <div class="panel-card payment-ledger-card">
        <div class="panel-title-row"><div><h3>Collection ledger</h3><p class="muted-text">${entries.length} ${entries.length === 1 ? 'record' : 'records'} shown</p></div><span class="badge">${formatCurrency(total)}</span></div>
        ${entries.length ? `<div class="payment-table-wrap"><table class="payment-table"><thead><tr><th>Patient Name</th><th>Reference Doctor</th><th>Report Date</th><th class="amount-column">Collected Amount</th></tr></thead><tbody>${entries.map((entry) => `<tr><td><strong>${escapeHtml(entry.patient?.name || 'Unnamed patient')}</strong></td><td>${escapeHtml(entry.patient?.doctor || 'Unassigned')}</td><td>${escapeHtml(formatPrintDate(entry.patient?.date))}</td><td class="amount-column"><strong>${formatCurrency(entry.patient?.amountPaid)}</strong></td></tr>`).join('')}</tbody><tfoot><tr><th colspan="3">Total</th><th class="amount-column">${formatCurrency(total)}</th></tr></tfoot></table></div>` : '<div class="empty-payment-state"><strong>No payment records found</strong><span>Save a report with at least one test to add it to this ledger.</span></div>'}
      </div>
    </div>
  `;
  const selectedDoctor = getPaymentFilters().doctor;
  const doctorFilter = document.getElementById('paymentDoctorFilter');
  if (doctorFilter) doctorFilter.value = selectedDoctor;
}

function renderPaymentsPrintPreview() {
  const entries = getFilteredPayments();
  const total = entries.reduce((sum, entry) => sum + (Number.parseFloat(entry.patient?.amountPaid) || 0), 0);
  document.getElementById('previewBody').innerHTML = `
    <div class="payment-print">
      <div class="payment-print-heading"><div><h1>Payment Collection Ledger</h1><p>Lab Report System</p></div><strong>${formatPrintDate(new Date().toISOString().slice(0, 10))}</strong></div>
      <table class="payment-table"><thead><tr><th>Patient Name</th><th>Reference Doctor</th><th>Report Date</th><th class="amount-column">Collected Amount</th></tr></thead><tbody>${entries.map((entry) => `<tr><td>${escapeHtml(entry.patient?.name || 'Unnamed patient')}</td><td>${escapeHtml(entry.patient?.doctor || 'Unassigned')}</td><td>${escapeHtml(formatPrintDate(entry.patient?.date))}</td><td class="amount-column">${formatCurrency(entry.patient?.amountPaid)}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="3">Total Collected</th><th class="amount-column">${formatCurrency(total)}</th></tr></tfoot></table>
    </div>
  `;
  document.getElementById('previewOverlay').classList.remove('hidden');
}

function renderSettings() {
  const editor = document.getElementById('editorContent');
  const storageBytes = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
  editor.innerHTML = `
    <div class="editor-stack settings-view">
      <div class="panel-card">
        <div class="panel-title-row"><div><h2>Settings</h2><p class="muted-text">Application status and local data management.</p></div><span class="badge">Local workspace</span></div>
        <div class="settings-grid">
          <div class="settings-item"><span>Saved report sheets</span><strong>${state.sheets.length}</strong></div>
          <div class="settings-item"><span>Payment records</span><strong>${state.history.length}</strong></div>
          <div class="settings-item"><span>Available templates</span><strong>${state.templates.length}</strong></div>
          <div class="settings-item"><span>Stored data size</span><strong>${(storageBytes / 1024).toFixed(1)} KB</strong></div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-title-row"><div><h3>Storage</h3><p class="muted-text">This version stores data in this browser. Database sync will be added before multi-device use.</p></div></div>
        <div class="settings-notice">Your reports remain on this device until browser storage is cleared.</div>
        <div class="settings-media">
          <label class="background-upload"><span>Change lab logo</span><input id="settingsLogoInput" type="file" accept="image/*" /><small>PNG or JPG, maximum 2 MB</small></label>
          <label class="background-upload"><span>Change login background</span><input id="settingsBackgroundInput" type="file" accept="image/*" /><small>PNG or JPG, maximum 2 MB</small></label>
        </div>
        <div class="inline-actions" style="margin-top:14px;"><span class="muted-text">Signed in as ${escapeHtml(currentUser?.email || 'Current user')}</span><button class="ghost-btn" data-sign-out>Sign out</button></div>
      </div>
    </div>
  `;
}

/* ---------- src/print-module.js ---------- */

/* ============================================================
   PRINT MODULE
   Renders the print-preview overlay in the exact layout of the
   source lab report (NewlabReports.docx): a two-column header
   (Name / Age-Sex / Ref By on the left, Date / Rep Time on the
   right), a dashed rule, a 3-column Parameter / Result Values /
   Biological Reference Range table with bold-underlined section
   headings, a centered "*** End of Report ***" footer, and a
   signature line.

   Depends on: utils.js, state.js. Calls into history-module.js
   (saveActiveSheetToHistory) so that printing a report also
   archives it — that's the only cross-module call this file makes.
   ============================================================ */

function formatPrintDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function genderWord(gender) {
  if (gender === 'M') return 'Male';
  if (gender === 'F') return 'Female';
  return '—';
}

function renderPrintPreview(snapshot) {
  const source = snapshot || getActiveSheet();
  const previewBody = document.getElementById('previewBody');
  const patient = source.patient;
  const repTime = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const hasCriticalInReport = source.tests.some((component) => component.tests.some((test) => isCriticalResult(test, patient.gender)));

  previewBody.innerHTML = `
    <div class="print-report">
      <div class="print-meta">
        <div class="print-meta-col">
          <div class="print-meta-row"><span class="meta-label">Name</span><span class="meta-colon">:</span><strong>${escapeHtml(patient.name || '—')}</strong></div>
          <div class="print-meta-row"><span class="meta-label">Age /Sex</span><span class="meta-colon">:</span><strong>${escapeHtml(patient.age || '—')} y/ ${genderWord(patient.gender)}</strong></div>
          <div class="print-meta-row"><span class="meta-label">Ref By</span><span class="meta-colon">:</span><strong>${escapeHtml(patient.doctor || '—')}</strong></div>
        </div>
        <div class="print-meta-col print-meta-col-right">
          <div class="print-meta-row"><span class="meta-label">Date</span><span class="meta-colon">:</span><strong>${formatPrintDate(patient.date)}</strong></div>
          <div class="print-meta-row"><span class="meta-label">Rep Time</span><span class="meta-colon">:</span><strong>${repTime}</strong></div>
        </div>
      </div>

      <div class="print-divider"></div>

      <table class="print-doc-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Result Values</th>
            <th>Biological Reference Range</th>
          </tr>
        </thead>
        <tbody>
          ${source.tests.map((component) => `
            <tr><td colspan="3" class="print-section-heading">${escapeHtml(component.name)}</td></tr>
            ${component.tests.length ? component.tests.map((test) => {
              const abnormal = isAbnormalResult(test, patient.gender);
              const critical = isCriticalResult(test, patient.gender);
              const displayValue = escapeHtml(test.value || '—');
              const testStyle = test.style || { isHeading: false, fontSize: 'medium', alignment: 'left', bold: false, italic: false };
              const fontSizeMap = { small: '11px', medium: '12px', large: '13px', xlarge: '14px' };
              const fontSize = fontSizeMap[testStyle.fontSize] || '12px';
              const styleStr = `font-size:${fontSize}; text-align:${testStyle.alignment}; font-weight:${testStyle.bold ? 'bold' : 'normal'}; font-style:${testStyle.italic ? 'italic' : 'normal'};${testStyle.isHeading ? ' border-bottom:1px solid #999; padding-bottom:6px; padding-top:6px;' : ''}`;
              const valueMarkup = critical ? `<strong class="print-critical-value">${displayValue}*</strong>` : (abnormal ? `<strong>${displayValue}</strong>` : displayValue);
              return `
              <tr ${testStyle.isHeading ? 'style="font-weight:700;"' : ''}>
                <td class="param-name" style="${styleStr}">${escapeHtml(test.name)}</td>
                <td class="param-value"><span class="meta-colon">:</span> ${valueMarkup} ${escapeHtml(test.unit || '')}</td>
                <td class="param-range">${escapeHtml(test.referenceRange || '')}</td>
              </tr>
            `;
            }).join('') : `<tr><td colspan="3" class="muted-text print-empty-row">No subtests selected for this section.</td></tr>`}
          `).join('')}
        </tbody>
      </table>

      ${hasCriticalInReport ? '<div class="print-critical-legend">* Critical value — requires urgent physician attention</div>' : ''}
      <div class="print-footer-note">*** End of Report ***</div>
      <div class="print-signature">
        <div class="signature-line"></div>
        <div>Signature</div>
      </div>
    </div>
  `;
}

function showPreviewOverlay(snapshot) {
  renderPrintPreview(snapshot);
  document.getElementById('previewOverlay').classList.remove('hidden');
}

function hidePreviewOverlay() {
  document.getElementById('previewOverlay').classList.add('hidden');
}

function exportPdf() {
  showToast('Open the print dialog and select "Save as PDF" to export.');
  window.print();
}

function printNow() {
  window.print();
}

/* ---------- src/entry.js ---------- */

/* ============================================================
   APP ENTRY POINT
   The only file that touches document-level event listeners. It
   knows nothing about how any module works internally — it just
   reads data-* attributes off the clicked/changed element and
   calls the matching function from patient-module.js,
   history-module.js, or print-module.js. This keeps the wiring
   between modules in exactly one place.

   Loaded last, after every module it calls into.
   ============================================================ */

function handleInput(event) {
  if (event.target.matches('#paymentSearch')) {
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;
    renderPayments();
    const searchInput = document.getElementById('paymentSearch');
    searchInput?.focus();
    searchInput?.setSelectionRange(selectionStart, selectionEnd);
    return;
  }

  if (event.target.matches('#historySearch')) {
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;
    renderHistory();
    const searchInput = document.getElementById('historySearch');
    searchInput?.focus();
    searchInput?.setSelectionRange(selectionStart, selectionEnd);
    return;
  }

  if (event.target.matches('[data-field]')) {
    updateSheetField(state.activeSheetId, event.target.dataset.field, event.target.value);
    renderSummary();
    return;
  }

  if (event.target.matches('[data-test-value]')) {
    updateTestValue(state.activeSheetId, event.target.dataset.testValue, event.target.dataset.testId, event.target.value);
    renderSummary();
  }
}

function handleChange(event) {
  if (event.target.matches('#paymentDoctorFilter, #paymentFromDate, #paymentToDate')) {
    renderPayments();
    return;
  }

  if (event.target.matches('#historyDoctorFilter, #historyFromDate, #historyToDate')) {
    renderHistory();
    return;
  }

  if (event.target.matches('[data-doctor-select]')) {
    const activeSheet = getActiveSheet();
    updateSheetField(activeSheet.id, 'patient.doctor', normalizeDoctorName(event.target.value));
    renderSummary();
  }

  if (event.target.matches('[data-select-component]')) {
    selectComponent(state.activeSheetId, event.target.value);
  }

  if (event.target.matches('[data-toggle-all-tests]')) {
    toggleAllTestsInSection(state.activeSheetId, event.target.dataset.toggleAllTests, event.target.checked);
  }

  if (event.target.matches('select[data-test-value]')) {
    updateTestValue(state.activeSheetId, event.target.dataset.testValue, event.target.dataset.testId, event.target.value);
    render();
  }

  if (event.target.matches('input[data-test-value]')) {
    render();
  }

  if (event.target.matches('#builderTestFontSize, #builderTestAlignment, #builderTestIsHeading')) {
    updateStylePreview();
  }
}

function handleClick(event) {
  const target = event.target.closest('button') || event.target;
  if (!target) return;

  // --- Patient module: report actions ---
  if (target.id === 'saveBtn') {
    const saved = saveActiveSheetToHistory();
    if (saved) {
      showToast('Report saved to history');
      if (state.view === 'history') render();
    }
    return;
  }

  if (target.id === 'addRowBtn' || target.closest('#addRowBtn')) {
    showToast('Use the section chips and main test blocks above to build the report');
    return;
  }

  // --- Print module ---
  if (target.id === 'printBtn' || target.closest('#printBtn')) {
    saveActiveSheetToHistory();
    showPreviewOverlay();
    return;
  }

  if (target.matches('[data-export-payments]')) {
    renderPaymentsPrintPreview();
    return;
  }

  if (target.matches('[data-clear-payment-filters]')) {
    ['paymentSearch', 'paymentFromDate', 'paymentToDate'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    const doctorFilter = document.getElementById('paymentDoctorFilter');
    if (doctorFilter) doctorFilter.value = 'all';
    renderPayments();
    return;
  }

  if (target.matches('[data-clear-history-filters]')) {
    ['historySearch', 'historyFromDate', 'historyToDate'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    const historyDoctorFilter = document.getElementById('historyDoctorFilter');
    if (historyDoctorFilter) historyDoctorFilter.value = 'all';
    renderHistory();
    return;
  }

  if (target.matches('[data-sign-out]')) {
    handleSignOut();
    return;
  }

  // --- Top nav (editor / history / settings) ---
  if (target.matches('[data-nav]')) {
    const nav = target.dataset.nav;
    state.view = nav;
    render();
    return;
  }

  // --- History module ---
  if (target.matches('[data-history-print]')) {
    const entry = state.history.find((item) => item.historyId === target.dataset.historyPrint);
    if (entry) showPreviewOverlay(entry);
    return;
  }

  if (target.matches('[data-history-reopen]')) {
    reopenHistoryEntryAsSheet(target.dataset.historyReopen);
    return;
  }

  if (target.matches('[data-history-delete]')) {
    deleteHistoryEntry(target.dataset.historyDelete);
    return;
  }

  // --- Print module: overlay controls ---
  if (target.id === 'exportPdfBtn' || target.closest('#exportPdfBtn')) {
    exportPdf();
    return;
  }

  if (target.id === 'closePreviewBtn' || target.closest('#closePreviewBtn')) {
    hidePreviewOverlay();
    return;
  }

  if (target.id === 'printNowBtn' || target.closest('#printNowBtn')) {
    printNow();
    return;
  }

  // --- Patient module: patient details, sections, components ---
  if (target.matches('[data-gender]')) {
    const activeSheet = getActiveSheet();
    updateSheetField(activeSheet.id, 'patient.gender', target.dataset.gender);
    renderSummary();
    render();
    return;
  }

  if (target.matches('[data-select-section]')) {
    state.activeSectionId = target.dataset.selectSection;
    persistState();
    render();
    return;
  }

  if (target.matches('[data-toggle-test]')) {
    toggleTestSelection(state.activeSheetId, target.dataset.section || state.activeSectionId, target.dataset.toggleTest);
    return;
  }

  if (target.matches('[data-add-doctor]')) {
    addDoctorToTemplate();
    return;
  }

  if (target.matches('[data-create-section]')) {
    const name = document.getElementById('newSectionInput')?.value;
    createSection(name);
    return;
  }

  if (target.matches('[data-rename-section]')) {
    const name = document.getElementById('renameSectionInput')?.value;
    renameSection(target.dataset.renameSection, name);
    return;
  }

  if (target.matches('[data-delete-section]')) {
    deleteSection(target.dataset.deleteSection);
    return;
  }

  if (target.matches('[data-save-template-test]')) {
    saveTemplateTest(target.dataset.saveTemplateTest);
    return;
  }

  if (target.matches('[data-edit-template-test]')) {
    startEditTemplateTest(target.dataset.editTemplateTest);
    return;
  }

  if (target.matches('[data-cancel-edit-test]')) {
    cancelEditTemplateTest();
    return;
  }

  if (target.matches('[data-bulk-add-tests]')) {
    bulkAddTemplateTests(target.dataset.bulkAddTests);
    return;
  }

  if (target.matches('[data-delete-template-test]')) {
    deleteTemplateTest(target.dataset.deleteTemplateTest, target.dataset.testId);
    return;
  }

  if (target.matches('[data-toggle="bold"], [data-toggle="italic"]')) {
    target.classList.toggle('active');
    updateStylePreview();
    return;
  }

  if (target.matches('[data-move-component]')) {
    moveComponent(state.activeSheetId, Number(target.dataset.moveComponent), Number(target.dataset.direction));
    return;
  }

  if (target.matches('[data-remove-component]')) {
    removeComponent(state.activeSheetId, target.dataset.removeComponent);
    return;
  }

  if (target.matches('[data-remove-test]')) {
    removeTestFromComponent(state.activeSheetId, target.dataset.removeTest, target.dataset.testId);
    return;
  }

  if (target.matches('[data-close-sheet]')) {
    closeSheet(target.dataset.closeSheet);
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && event.target.id === 'builderTestName') {
    event.preventDefault();
    const saveBtn = document.querySelector('[data-save-template-test]');
    if (saveBtn) {
      saveTemplateTest(saveBtn.dataset.saveTemplateTest);
      setTimeout(() => document.getElementById('builderTestName')?.focus(), 0);
    }
  }
}

document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
document.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKeydown);

// Attach form listeners with retry logic
function attachFormListeners() {
  const authForm = document.getElementById('authForm');
  const authToggleBtn = document.getElementById('authToggleBtn');
  
  if (!authForm) {
    console.warn('authForm not found, retrying...');
    setTimeout(attachFormListeners, 100);
    return;
  }
  
  console.log('✓ Attaching form listeners');
  authForm.addEventListener('submit', handleAuthSubmit);
  
  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', () => {
      updateAuthMode(authMode !== 'signup');
      setAuthMessage('');
    });
  }
}

// Attach immediately and retry if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachFormListeners);
} else {
  attachFormListeners();
}
function bindBrandingUpload(inputId, storageKey) {
  document.getElementById(inputId)?.addEventListener('change', (event) => {
    readImageFile(event.target.files?.[0], async (dataUrl) => {
      localStorage.setItem(storageKey(), dataUrl);
      applyLoginBackground();
      if (currentUser) await saveProfileMedia();
      setAuthMessage('Branding updated.');
      if (state.view === 'settings') renderSettings();
    });
  });
}

bindBrandingUpload('authBackgroundInput', backgroundStorageKey);
bindBrandingUpload('authLogoInput', () => mediaStorageKey('lab-login-logo'));
bindBrandingUpload('settingsBackgroundInput', backgroundStorageKey);
bindBrandingUpload('settingsLogoInput', () => mediaStorageKey('lab-login-logo'));

loadState();
render();
showToast('Report editor ready');

// Initialize Supabase client (after all functions are defined)
function initSupabaseClient() {
  if (!window.supabase) {
    console.error('✗ Supabase library not available');
    showToast('Error: Supabase library not loaded');
    return false;
  }
  
  try {
    supabaseDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase client initialized successfully');
    showToast('Supabase ready');
    return true;
  } catch (error) {
    console.error('✗ Error creating Supabase client:', error);
    showToast('Error: Could not initialize Supabase - ' + error.message);
    return false;
  }
}

if (window.supabase) {
  initSupabaseClient();
} else {
  console.warn('Waiting for Supabase library to load...');
  const checkSupabase = setInterval(() => {
    if (window.supabase) {
      clearInterval(checkSupabase);
      initSupabaseClient();
    }
  }, 100);
  
  setTimeout(() => {
    if (!supabaseDb) {
      console.error('Supabase library failed to load');
      showToast('Error: Supabase took too long to load');
    }
  }, 10000);
}

initializeAuth();
