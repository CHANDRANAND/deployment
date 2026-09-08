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
          { id: 'haemoglobin', name: 'Haemoglobin', unit: 'gm%', referenceRange: 'M: 13.5 - 16.5 gm/dl | F: 11.5 - 14.5 gm/dl', criticalLow: '7.0', criticalHigh: '20.0' },
          { id: 'trbc', name: 'TRBC (Erythrocytes)', unit: 'millions/cumm', referenceRange: 'M: 4.0 - 6.0 | F: 3.5 - 5.5 millions/cumm' },
          { id: 'pcv', name: 'PCV', unit: '%', referenceRange: 'M: 40 - 52% | F: 37 - 47%' },
          { id: 'mcv', name: 'MCV', unit: 'fl', referenceRange: '82 - 94 fl' },
          { id: 'mch', name: 'MCH', unit: 'Pg', referenceRange: '27 - 32 Pg' },
          { id: 'mchc', name: 'MCHC', unit: '%', referenceRange: '30 - 36%' },
          { id: 'twbc', name: 'TWBC', unit: 'Cells/cumm', referenceRange: '4,000 - 11,000/cumm (1-12yr: 4,000-14,000)', criticalLow: '2000', criticalHigh: '30000' },
          { id: 'platelet-count', name: 'Platelet Count (Thrombocytes)', unit: 'Lakhs/cumm', referenceRange: '1.5 - 4.5 Lakhs/cumm', criticalLow: '0.5' },
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
          { id: 'malaria', name: 'Malaria (P.f & P.v)', unit: '', referenceRange: 'Negative', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'], criticalOptions: ['Positive'] },
          { id: 's-typhi-o', name: 'S. Typhi "O"', unit: 'dilution', referenceRange: '' },
          { id: 's-typhi-h', name: 'S. Typhi "H"', unit: 'dilution', referenceRange: '' }
        ]
      },
      {
        id: 'biochemistry',
        name: 'Biochemistry',
        tests: [
          { id: 'total-bilirubin-bio', name: 'Total Bilirubin', unit: 'mg/dl', referenceRange: '< 1.2 mg/dl' },
          { id: 'random-blood-sugar', name: 'Random Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 140 mg/dl', criticalLow: '50', criticalHigh: '400' },
          { id: 'fasting-blood-sugar', name: 'Fasting Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 110 mg/dl', criticalLow: '50', criticalHigh: '400' },
          { id: 'postprandial-blood-sugar', name: 'Postprandial Blood Sugar', unit: 'mg/dl', referenceRange: '80 - 160 mg/dl', criticalHigh: '400' },
          { id: 'serum-calcium', name: 'Serum Calcium', unit: 'mg/dl', referenceRange: '8.0 - 11.0 mg/dl', criticalLow: '6.5', criticalHigh: '13.0' },
          { id: 'serum-creatinine', name: 'Serum Creatinine', unit: 'mg/dl', referenceRange: '0.5 - 1.4 mg/dl', criticalHigh: '4.0' },
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
          { id: 'vldl-cholesterol', name: 'VLDL Cholesterol', unit: 'mg/dl', referenceRange: '< 40 mg/dl', formula: '{triglycerides} / 5' },
          { id: 'chol-hdl-ratio', name: 'Total Cholesterol / HDL Ratio', unit: 'ratio', referenceRange: '3.5 - 4.4', formula: '{total-cholesterol} / {hdl-cholesterol}' },
          { id: 'ldl-hdl-ratio', name: 'LDL Cholesterol / HDL Ratio', unit: 'ratio', referenceRange: '1.8 - 3.0', formula: '{ldl-cholesterol} / {hdl-cholesterol}' }
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
          { id: 'ag-ratio', name: 'A/G Ratio', unit: 'ratio', referenceRange: '0.8 - 2.0', formula: '{albumin} / {globulin}' }
        ]
      },
      {
        id: 'urine-physical',
        name: 'Urine Examination - Physical',
        tests: [
          { id: 'urine-colour', name: 'Colour', unit: '', referenceRange: 'Pale Yellow', options: ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber', 'Straw', 'Clear', 'Reddish', 'Turbid'] },
          { id: 'urine-appearance', name: 'Appearance', unit: '', referenceRange: 'Clear', options: ['Clear', 'Hazy', 'Turbid', 'Cloudy'] },
          { id: 'urine-albumin', name: 'Urine Albumin', unit: '', referenceRange: 'Nil', options: ['Nil', 'Trace', '1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], abnormalOptions: ['1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'] },
          { id: 'urine-sugar', name: 'Urine Sugar', unit: '', referenceRange: 'Nil', options: ['Nil', 'Trace', '1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'], abnormalOptions: ['1+ (+)', '2+ (++)', '3+ (+++)', '4+ (++++)'] },
          { id: 'bile-salts', name: 'Bile Salts', unit: '', referenceRange: 'Negative', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'] },
          { id: 'bile-pigments', name: 'Bile Pigments', unit: '', referenceRange: 'Negative', options: ['Negative', 'Positive'], abnormalOptions: ['Positive'] }
        ]
      },
      {
        id: 'urine-microscopic',
        name: 'Urine Examination - Microscopic',
        tests: [
          { id: 'pus-cells', name: 'Pus Cells', unit: '/hpf', referenceRange: '0 - 5 /hpf' },
          { id: 'epithelial-cells', name: 'Epithelial Cells', unit: '/hpf', referenceRange: '0 - 5 /hpf' },
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
          { id: 'hba1c', name: 'HbA1c', unit: '%', referenceRange: '4-6 Non-diabetic | 6-7 Good control | 7-8 Fair control | 8-10 Unsatisfactory | >10 Poor control', criticalHigh: '12.0' },
          { id: 'avg-blood-glucose', name: 'Average Blood Glucose', unit: 'mg/dl', referenceRange: '70 - 126 mg/dl', formula: '28.7 * {hba1c} - 46.7' }
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
          { id: 'bt', name: 'BT (Bleeding Time)', unit: 'min:sec', referenceRange: '1:00 - 3:00 min' },
          { id: 'ct', name: 'CT (Clotting Time)', unit: 'min:sec', referenceRange: '3:00 - 7:00 min' }
        ]
      },
      {
        id: 'serology-infectious',
        name: 'Serology - Infectious Screening',
        tests: [
          { id: 'hiv-1', name: 'HIV I (Tridot Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'] },
          { id: 'hiv-2', name: 'HIV II (Tridot Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'] },
          { id: 'hbsag', name: 'HBsAg (Strip Method)', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'] },
          { id: 'hepatitis-c', name: 'Hepatitis C Virus', unit: '', referenceRange: 'Non-Reactive', options: ['Non-Reactive', 'Reactive'], abnormalOptions: ['Reactive'], criticalOptions: ['Reactive'] }
        ]
      },
      {
        id: 'electrolytes',
        name: 'Serum Electrolytes',
        tests: [
          { id: 'sodium', name: 'Sodium', unit: 'mmol/L', referenceRange: '135.0 - 150 mmol/L', criticalLow: '120', criticalHigh: '160' },
          { id: 'potassium', name: 'Potassium', unit: 'mmol/L', referenceRange: '3.5 - 5.5 mmol/L', criticalLow: '2.8', criticalHigh: '6.5' },
          { id: 'chloride', name: 'Chloride', unit: 'mmol/L', referenceRange: '94 - 110 mmol/L' },
          { id: 'ionized-calcium', name: 'Ionized Calcium', unit: 'mmol/L', referenceRange: '1.10 - 1.32 mmol/L' }
        ]
      }
    ]
  }
];
