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
    forDoctor: null,
    doctors: ['Dr. Sharma', 'Dr. Mehta'],
    printSettings: {
      headerSpacing: 0,
      footerSpacing: 0,
      headerText: '',
      footerText: '',
      metaLayout: 'default',
      metaBoxed: false,
      signatureImage: ''
    },
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
  templates.forEach((template) => {
    if (!('forDoctor' in template)) template.forDoctor = null;
    if (!Array.isArray(template.doctors)) template.doctors = [];
    if (!template.printSettings || typeof template.printSettings !== 'object') {
      template.printSettings = {
        headerSpacing: 0, footerSpacing: 0, headerText: '', footerText: '',
        metaLayout: 'default', metaBoxed: false, signatureImage: ''
      };
    } else {
      const defaults = { headerSpacing: 0, footerSpacing: 0, headerText: '', footerText: '', metaLayout: 'default', metaBoxed: false, signatureImage: '' };
      template.printSettings = { ...defaults, ...template.printSettings };
    }
  });
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
    style: test.style ? { ...test.style } : undefined,
    value: ''
  }));
}

function makeSheet() {
  const registry = getDoctorRegistryTemplate();
  const initialDoctor = normalizeDoctorName(registry.doctors[0]);
  const template = getTemplateForDoctor(initialDoctor);
  const componentName = template.sections[0]?.name || 'Report';
  const component = makeComponent(componentName, getDefaultTestsForComponentName(componentName, template));
  return {
    id: createId(),
    patient: {
      name: '',
      age: '',
      gender: 'M',
      amountPaid: '',
      doctor: initialDoctor,
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
  builderTemplateId: 'core-lab',
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
    const componentName = template.sections[0]?.name || 'Report';
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

  // If a component's name no longer matches any section in its template
  // (e.g. sections were renamed/trimmed after this report was created,
  // leaving a stale label like "CBC" behind), quietly relabel it to the
  // template's current first section — this only touches the display
  // name, never the tests or values already entered inside it.
  const sectionNamesAndIds = new Set();
  template.sections.forEach((section) => {
    sectionNamesAndIds.add(section.id.toLowerCase());
    sectionNamesAndIds.add(section.name.toLowerCase());
  });
  sheet.tests.forEach((component) => {
    const normalizedName = (component.name || '').trim().toLowerCase();
    if (!sectionNamesAndIds.has(normalizedName)) {
      component.name = template.sections[0]?.name || 'Report';
    }
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
  showToast('Syncing your data…');
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
    // 'local' scope clears the session on this device immediately, without
    // waiting on a network round-trip to revoke it server-side first. The
    // default 'global' scope needs that round-trip to succeed before the
    // local session is cleared — if it's slow or hiccups, the old session
    // token can be left behind, which is what caused login to silently
    // fail right after logout until the cache was cleared or an incognito
    // window (fresh storage) was used.
    await supabaseDb?.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.warn('Supabase sign-out failed', error);
  }

  // Defensive cleanup: remove any Supabase auth token left in localStorage
  // regardless of how signOut() went, so a fresh sign-in never has to
  // contend with a stale session.
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Could not clear stale Supabase session keys', error);
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

/* ----------------------------------------------------------------
   Doctor-specific templates.

   'core-lab' is the one shared default template. A lab can also
   create a customized copy of it "for" a specific doctor (their own
   section layout, styling, ranges, whatever they like) by setting
   template.forDoctor to that doctor's name. When a report's Doctor
   field matches a doctor with a custom template, that template is
   used automatically; otherwise the report always falls back to the
   shared default — nobody has to remember which doctors have one.

   The doctors LIST itself (used to populate the Doctor dropdown)
   always lives on 'core-lab', never on a per-doctor template, so
   adding a new doctor is visible everywhere regardless of which
   template is currently active.
   ---------------------------------------------------------------- */

function getDoctorRegistryTemplate() {
  return getTemplateById('core-lab');
}

function getTemplateForDoctor(doctorName) {
  const normalized = normalizeDoctorName(doctorName);
  if (!normalized) return getTemplateById('core-lab');
  const custom = state.templates.find((template) => template.forDoctor && normalizeDoctorName(template.forDoctor) === normalized);
  return custom || getTemplateById('core-lab');
}

function applyDoctorTemplate(sheetId, doctorName) {
  const sheet = state.sheets.find((item) => item.id === sheetId);
  if (!sheet) return;

  const resolvedTemplate = getTemplateForDoctor(doctorName);
  if (sheet.templateId === resolvedTemplate.id) return;

  sheet.templateId = resolvedTemplate.id;

  // Only reset the selected tests if nothing has been picked yet.
  // If the lab already started building this report, switching the
  // doctor shouldn't silently wipe their work — it just changes
  // which template future test-picking pulls from.
  const hasAnyTests = sheet.tests.some((component) => component.tests.length > 0);
  if (!hasAnyTests) {
    const componentName = resolvedTemplate.sections[0]?.name || 'Report';
    const component = makeComponent(componentName, getDefaultTestsForComponentName(componentName, resolvedTemplate));
    sheet.tests = [component];
    sheet.activeComponentId = component.id;
  }

  persistState();
}

function getBuilderTemplate() {
  return getTemplateById(state.builderTemplateId || 'core-lab');
}

function getPrintSettings(template) {
  const defaults = { headerSpacing: 0, footerSpacing: 0, headerText: '', footerText: '', metaLayout: 'default', metaBoxed: false, signatureImage: '' };
  return { ...defaults, ...(template?.printSettings || {}) };
}

function updatePrintSetting(templateId, key, value) {
  const template = getTemplateById(templateId);
  if (!template) return;
  if (!template.printSettings) template.printSettings = getPrintSettings(null);
  template.printSettings[key] = value;
  persistState();
}

function selectBuilderTemplate(templateId) {
  state.builderTemplateId = templateId;
  state.builderEditingTestId = null;
  render();
}

function createDoctorTemplate(doctorName) {
  const normalized = normalizeDoctorName(doctorName);
  if (!normalized) {
    showToast('Choose a doctor first');
    return;
  }

  const existing = state.templates.find((template) => template.forDoctor && normalizeDoctorName(template.forDoctor) === normalized);
  if (existing) {
    state.builderTemplateId = existing.id;
    render();
    showToast(`${normalized} already has a custom template — now editing it`);
    return;
  }

  const source = getBuilderTemplate();
  const clone = JSON.parse(JSON.stringify(source));
  clone.id = `doctor-${createId()}`;
  clone.name = `${normalized} — Custom Template`;
  clone.forDoctor = normalized;
  state.templates.push(clone);
  state.builderTemplateId = clone.id;
  state.builderEditingTestId = null;
  persistState();
  render();
  showToast(`Created a custom template for ${normalized}, based on "${source.name}"`);
}

function deleteDoctorTemplate(templateId) {
  const template = state.templates.find((item) => item.id === templateId);
  if (!template || !template.forDoctor) {
    showToast('The default template cannot be deleted');
    return;
  }

  state.templates = state.templates.filter((item) => item.id !== templateId);
  state.sheets.forEach((sheet) => {
    if (sheet.templateId === templateId) sheet.templateId = 'core-lab';
  });
  state.builderTemplateId = 'core-lab';
  state.builderEditingTestId = null;
  persistState();
  render();
  showToast(`Deleted ${template.forDoctor}'s custom template — reverted to default`);
}

function getCurrentSection(template) {
  return template.sections.find((section) => section.id === state.activeSectionId) || template.sections[0];
}

function getActiveComponent(sheet) {
  const normalizedSheet = normalizeSheet(sheet);
  return normalizedSheet.tests.find((component) => component.id === normalizedSheet.activeComponentId) || normalizedSheet.tests[0];
}
