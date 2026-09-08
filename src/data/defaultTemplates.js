export const DEFAULT_TEMPLATES = [
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
      'Urine Examination - Physical',
      'Urine Examination - Microscopic',
      'HbA1c & Glucose',
      'Serology - Blood Group',
      'Coagulation Profile',
      'Serology - Infectious Screening',
      'Serum Electrolytes',
      'Thyroid Function Test',
      'Kidney Function Test'
    ],
    sections: [
      // ─── HEMATOLOGY ───────────────────────────────────────────────────────────
      {
        id: 'hematology',
        name: 'Hematology - Complete Haemogram',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'haemoglobin',    type: 'normal',  name: 'Haemoglobin',                  unit: 'gm%',         referenceRange: 'M: 13.5 - 16.5 gm/dl | F: 11.5 - 14.5 gm/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'trbc',           type: 'normal',  name: 'TRBC (Erythrocytes)',           unit: 'millions/cumm', referenceRange: 'M: 4.0 - 6.0 | F: 3.5 - 5.5 millions/cumm', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'pcv',            type: 'normal',  name: 'PCV (Packed Cell Volume)',      unit: '%',           referenceRange: 'M: 40 - 52% | F: 37 - 47%',                   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'rbc-indices-h',  type: 'heading', name: 'RBC Indices',                  unit: '',            referenceRange: '',                                              formula: '', options: [], style: { fontSize: 13, bold: true,  italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'mcv',            type: 'normal',  name: 'MCV',                          unit: 'fl',          referenceRange: '82 - 94 fl',                                   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'mch',            type: 'normal',  name: 'MCH',                          unit: 'Pg',          referenceRange: '27 - 32 Pg',                                   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'mchc',           type: 'normal',  name: 'MCHC',                         unit: '%',           referenceRange: '30 - 36%',                                     formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'twbc',           type: 'normal',  name: 'TWBC (Total WBC)',              unit: 'Cells/cumm',  referenceRange: '4,000 - 11,000/cumm',                          formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'platelet-count', type: 'normal',  name: 'Platelet Count (Thrombocytes)', unit: 'Lakhs/cumm',  referenceRange: '1.5 - 4.5 Lakhs/cumm',                        formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'esr',            type: 'normal',  name: 'ESR',                          unit: 'mm/1hr',      referenceRange: 'M: 0 - 15 mm | F: 0 - 20 mm',                 formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'crp',            type: 'normal',  name: 'CRP ("C" Reactive Protein)',   unit: 'mg/dL',       referenceRange: 'Normal: < 6 mg/dL',                            formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── DIFFERENTIAL WBC ─────────────────────────────────────────────────────
      {
        id: 'differential-wbc',
        name: 'Differential WBC Count',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'polymorphs',   type: 'normal', name: 'Polymorphs',   unit: '%', referenceRange: '40 - 75%',                          formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'lymphocytes',  type: 'normal', name: 'Lymphocytes',  unit: '%', referenceRange: 'Adult: 24 - 44% | Child: 35 - 65%', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'eosinophils',  type: 'normal', name: 'Eosinophils',  unit: '%', referenceRange: '< 3%',                              formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'monocytes',    type: 'normal', name: 'Monocytes',    unit: '%', referenceRange: '< 4%',                              formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'basophils',    type: 'normal', name: 'Basophils',    unit: '%', referenceRange: '< 1%',                              formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── MALARIA & WIDAL ──────────────────────────────────────────────────────
      {
        id: 'malaria-widal',
        name: 'Malaria & Widal',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'malaria',    type: 'normal', name: 'Malaria (P.f & P.v)', unit: '',        referenceRange: 'Negative', formula: '', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'], criticalOptions: ['Positive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 's-typhi-o',  type: 'normal', name: 'S. Typhi "O"',        unit: 'dilution', referenceRange: 'Negative (< 1:80)',       formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 's-typhi-h',  type: 'normal', name: 'S. Typhi "H"',        unit: 'dilution', referenceRange: 'Negative (< 1:80)',       formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── BIOCHEMISTRY ─────────────────────────────────────────────────────────
      {
        id: 'biochemistry',
        name: 'Biochemistry',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'random-blood-sugar',       type: 'normal', name: 'Random Blood Sugar',      unit: 'mg/dl', referenceRange: '80 - 140 mg/dl',  formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'fasting-blood-sugar',      type: 'normal', name: 'Fasting Blood Sugar',     unit: 'mg/dl', referenceRange: '80 - 110 mg/dl',  formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'postprandial-blood-sugar', type: 'normal', name: 'Postprandial Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 160 mg/dl',  formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'serum-calcium',            type: 'normal', name: 'Serum Calcium',            unit: 'mg/dl', referenceRange: '8.0 - 11.0 mg/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'total-bilirubin-bio',      type: 'normal', name: 'Total Bilirubin',          unit: 'mg/dl', referenceRange: '< 1.2 mg/dl',    formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'amylase',                  type: 'normal', name: 'Amylase (Serum)',           unit: 'U/L',   referenceRange: 'Up to 90 U/L',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'lipase',                   type: 'normal', name: 'Lipase (Serum)',            unit: 'U/L',   referenceRange: 'Up to 60 U/L',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── LIPID PROFILE ────────────────────────────────────────────────────────
      {
        id: 'lipid-profile',
        name: 'Lipid Profile',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'total-cholesterol', type: 'normal', name: 'Total Cholesterol',              unit: 'mg/dl', referenceRange: 'Desirable: < 200 | Borderline: 200–239 | High: > 240',                                         formula: '',                                      options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'triglycerides',     type: 'normal', name: 'Triglycerides',                  unit: 'mg/dl', referenceRange: 'M: 60–165 mg/dl | F: 40–140 mg/dl',                                                             formula: '',                                      options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'hdl-cholesterol',   type: 'normal', name: 'HDL Cholesterol (Direct)',        unit: 'mg/dl', referenceRange: 'M: 35–80 mg/dl | F: 42–88 mg/dl',                                                               formula: '',                                      options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'ldl-cholesterol',   type: 'normal', name: 'LDL Cholesterol',                unit: 'mg/dl', referenceRange: 'Optimal: < 100 | Near optimal: 100–129 | Borderline high: 130–159 | High: 160–189 | Very high: ≥190', formula: '',                                   options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'vldl-cholesterol',  type: 'normal', name: 'VLDL Cholesterol',               unit: 'mg/dl', referenceRange: '< 40 mg/dl',                                                                                    formula: '{triglycerides} / 5',                   options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'chol-hdl-ratio',    type: 'normal', name: 'Total Cholesterol / HDL Ratio', unit: 'ratio', referenceRange: '3.5 - 4.4',                                                                                     formula: '{total-cholesterol} / {hdl-cholesterol}', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'ldl-hdl-ratio',     type: 'normal', name: 'LDL Cholesterol / HDL Ratio',   unit: 'ratio', referenceRange: '1.8 - 3.0',                                                                                     formula: '{ldl-cholesterol} / {hdl-cholesterol}',  options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── LIVER FUNCTION TEST ──────────────────────────────────────────────────
      {
        id: 'lft',
        name: 'Liver Function Test',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'lft-bilirubin-h',   type: 'heading', name: 'Bilirubin',       unit: '', referenceRange: '', formula: '', options: [], style: { fontSize: 13, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'total-bilirubin',   type: 'normal',  name: 'Total Bilirubin', unit: 'mg/dl', referenceRange: '< 1.2 mg/dl',  formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'direct-bilirubin',  type: 'normal',  name: 'Direct Bilirubin', unit: 'mg/dl', referenceRange: '< 0.3 mg/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'indirect-bilirubin',type: 'normal',  name: 'Indirect Bilirubin', unit: 'mg/dl', referenceRange: '< 0.9 mg/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'lft-enzymes-h',     type: 'heading', name: 'Liver Enzymes',   unit: '', referenceRange: '', formula: '', options: [], style: { fontSize: 13, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'sgpt-alt',          type: 'normal',  name: 'SGPT / ALT',      unit: 'IU/L',  referenceRange: '< 46 IU/L',    formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'sgot-ast',          type: 'normal',  name: 'SGOT / AST',      unit: 'IU/L',  referenceRange: '< 46 IU/L',    formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'alp',               type: 'normal',  name: 'A L P',           unit: 'IU/L',  referenceRange: '70 - 306 IU/L', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'lft-proteins-h',    type: 'heading', name: 'Proteins',        unit: '', referenceRange: '', formula: '', options: [], style: { fontSize: 13, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'total-proteins',    type: 'normal',  name: 'Total Proteins',  unit: 'g/dl',  referenceRange: '6.0 - 8.0 g/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'albumin',           type: 'normal',  name: 'Albumin',         unit: 'g/dl',  referenceRange: '3.4 - 5.5 g/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'globulin',          type: 'normal',  name: 'Globulin',        unit: 'g/dl',  referenceRange: '2.0 - 3.5 g/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'ag-ratio',          type: 'normal',  name: 'A/G Ratio',       unit: 'ratio', referenceRange: '0.8 - 2.0',     formula: '{albumin} / {globulin}', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── URINE — PHYSICAL ─────────────────────────────────────────────────────
      {
        id: 'urine-physical',
        name: 'Urine Examination - Physical',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'urine-colour',     type: 'normal', name: 'Colour',        unit: '', referenceRange: 'Pale Yellow', formula: '', options: ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber', 'Straw', 'Clear', 'Reddish', 'Turbid'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-appearance', type: 'normal', name: 'Appearance',    unit: '', referenceRange: 'Clear',       formula: '', options: ['Clear', 'Hazy', 'Turbid', 'Cloudy'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-reaction',   type: 'normal', name: 'Reaction (pH)', unit: '', referenceRange: '4.5 - 8.0',  formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'specific-gravity', type: 'normal', name: 'Specific Gravity', unit: '', referenceRange: '1.010 - 1.025', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-albumin',    type: 'normal', name: 'Urine Albumin', unit: '', referenceRange: 'Nil',         formula: '', options: ['Nil', 'Trace', '1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], abnormalOptions: ['1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-sugar',      type: 'normal', name: 'Urine Sugar',   unit: '', referenceRange: 'Nil',         formula: '', options: ['Nil', 'Trace', '1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], abnormalOptions: ['1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'bile-salts',       type: 'normal', name: 'Bile Salts',    unit: '', referenceRange: 'Negative',    formula: '', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'bile-pigments',    type: 'normal', name: 'Bile Pigments', unit: '', referenceRange: 'Negative',    formula: '', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── URINE — MICROSCOPIC ──────────────────────────────────────────────────
      {
        id: 'urine-microscopic',
        name: 'Urine Examination - Microscopic',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'pus-cells',       type: 'normal', name: 'Pus Cells',        unit: '/hpf', referenceRange: '0 - 5 /hpf', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'epithelial-cells',type: 'normal', name: 'Epithelial Cells', unit: '/hpf', referenceRange: '0 - 5 /hpf', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-rbc',       type: 'normal', name: 'RBC',              unit: '/hpf', referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'casts',           type: 'normal', name: 'Casts',            unit: '',     referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'crystals',        type: 'normal', name: 'Crystals',         unit: '',     referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'bacteria',        type: 'normal', name: 'Bacteria',         unit: '',     referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'mucus',           type: 'normal', name: 'Mucus Threads',    unit: '',     referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'urine-others',    type: 'normal', name: 'Others',           unit: '',     referenceRange: 'Nil',         formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── HbA1c & GLUCOSE ──────────────────────────────────────────────────────
      {
        id: 'hba1c-section',
        name: 'HbA1c & Glucose',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'hba1c',             type: 'normal', name: 'HbA1c',                unit: '%',    referenceRange: '4–6 Non-diabetic | 6–7 Good control | 7–8 Fair control | 8–10 Unsatisfactory | >10 Poor control', formula: '',                    options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'avg-blood-glucose', type: 'normal', name: 'Average Blood Glucose', unit: 'mg/dl', referenceRange: '70 - 126 mg/dl',                                                                                formula: '28.7 * {hba1c} - 46.7', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── SEROLOGY — BLOOD GROUP ───────────────────────────────────────────────
      {
        id: 'blood-group',
        name: 'Serology - Blood Group',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'blood-grouping', type: 'normal', name: 'Blood Grouping', unit: '', referenceRange: '', formula: '', options: ['A', 'B', 'AB', 'O'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'rh-typing',      type: 'normal', name: 'Rh Typing',      unit: '', referenceRange: '', formula: '', options: ['Positive', 'Negative'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── COAGULATION ──────────────────────────────────────────────────────────
      {
        id: 'coagulation',
        name: 'Coagulation Profile',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'bt', type: 'normal', name: 'BT (Bleeding Time)', unit: 'min:sec', referenceRange: '1:00 - 3:00 min', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'ct', type: 'normal', name: 'CT (Clotting Time)', unit: 'min:sec', referenceRange: '3:00 - 7:00 min', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── SEROLOGY — INFECTIOUS SCREENING ─────────────────────────────────────
      {
        id: 'serology-infectious',
        name: 'Serology - Infectious Screening',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'hiv-1',       type: 'normal', name: 'HIV I (Tridot Method)',    unit: '', referenceRange: 'Non-Reactive', formula: '', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'hiv-2',       type: 'normal', name: 'HIV II (Tridot Method)',   unit: '', referenceRange: 'Non-Reactive', formula: '', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'hbsag',       type: 'normal', name: 'HBsAg (Strip Method)',     unit: '', referenceRange: 'Non-Reactive', formula: '', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'hepatitis-c', type: 'normal', name: 'Hepatitis C Virus (HCV)',  unit: '', referenceRange: 'Non-Reactive', formula: '', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'vdrl',        type: 'normal', name: 'VDRL (Syphilis)',          unit: '', referenceRange: 'Non-Reactive', formula: '', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── SERUM ELECTROLYTES ───────────────────────────────────────────────────
      {
        id: 'electrolytes',
        name: 'Serum Electrolytes',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'sodium',          type: 'normal', name: 'Sodium (Na⁺)',       unit: 'mmol/L', referenceRange: '135 - 150 mmol/L',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'potassium',       type: 'normal', name: 'Potassium (K⁺)',     unit: 'mmol/L', referenceRange: '3.5 - 5.5 mmol/L',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'chloride',        type: 'normal', name: 'Chloride (Cl⁻)',     unit: 'mmol/L', referenceRange: '94 - 110 mmol/L',    formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'ionized-calcium', type: 'normal', name: 'Ionized Calcium',    unit: 'mmol/L', referenceRange: '1.10 - 1.32 mmol/L', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── THYROID FUNCTION TEST (NEW) ──────────────────────────────────────────
      {
        id: 'thyroid-function',
        name: 'Thyroid Function Test',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 't3',  type: 'normal', name: 'T3 (Triiodothyronine)', unit: 'ng/dL',  referenceRange: '80 - 200 ng/dL',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 't4',  type: 'normal', name: 'T4 (Thyroxine)',        unit: 'µg/dL',  referenceRange: '5.0 - 12.0 µg/dL', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'tsh', type: 'normal', name: 'TSH (Thyroid Stimulating Hormone)', unit: 'µIU/mL', referenceRange: '0.4 - 4.0 µIU/mL', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      },

      // ─── KIDNEY FUNCTION TEST (NEW) ───────────────────────────────────────────
      {
        id: 'kidney-function',
        name: 'Kidney Function Test',
        subheading: '',
        headingStyle: { fontSize: 15, bold: true, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        subheadingStyle: { fontSize: 12, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' },
        tests: [
          { id: 'blood-urea',       type: 'normal', name: 'Blood Urea',       unit: 'mg/dl',  referenceRange: '15 - 45 mg/dl',   formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'serum-creatinine', type: 'normal', name: 'Serum Creatinine', unit: 'mg/dl',  referenceRange: 'M: 0.7 - 1.4 mg/dl | F: 0.5 - 1.1 mg/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'uric-acid',        type: 'normal', name: 'Uric Acid',        unit: 'mg/dl',  referenceRange: 'M: 3.5 - 8.5 mg/dl | F: 2.5 - 7.5 mg/dl', formula: '', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } },
          { id: 'bun-creat-ratio',  type: 'normal', name: 'BUN / Creatinine Ratio', unit: 'ratio', referenceRange: '10 - 20',      formula: '{blood-urea} / {serum-creatinine}', options: [], style: { fontSize: 14, bold: false, italic: false, underline: false, alignment: 'left', fontFamily: '' } }
        ]
      }
    ]
  }
];
