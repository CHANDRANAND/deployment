import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates.js';
import { createId, getIndiaDateTimeValue, getIndiaDateValue } from '../utils/formatters.js';
import { recalculateComponentFormulas } from '../utils/clinicalCalculations.js';
import { useAuth } from './AuthContext.jsx';

const STORAGE_KEY_PREFIX = 'lab-report-system-state-react-v1';

export const AppContext = createContext(null);

export function makeEmptySheet(template = DEFAULT_TEMPLATES[0]) {
  const clonedSections = JSON.parse(JSON.stringify(template.sections || []));
  return {
    id: createId(),
    templateId: template.id,
    activeComponentId: clonedSections[0]?.id || '',
    patient: {
      name: '',
      age: '',
      gender: 'M',
      doctor: template.doctors?.[0] || 'Dr. Self',
      sampleCollectedAt: getIndiaDateTimeValue(),
      reportDate: getIndiaDateValue(),
      notes: ''
    },
    tests: clonedSections.map((section) => recalculateComponentFormulas(section)),
    billing: {
      totalAmount: 500,
      discount: 0,
      paidAmount: 500,
      paymentMethod: 'Cash',
      status: 'Paid'
    }
  };
}

function recalculateSheetFormulas(sheet) {
  return {
    ...sheet,
    tests: Array.isArray(sheet.tests) ? sheet.tests.map((component) => recalculateComponentFormulas(component)) : []
  };
}

export function AppProvider({ children }) {
  const { currentUser, supabaseClient } = useAuth();
  const [currentView, setCurrentView] = useState('editor'); // 'editor' | 'history' | 'templates' | 'settings' | 'payments'
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [sheets, setSheets] = useState(() => [makeEmptySheet(DEFAULT_TEMPLATES[0])]);
  const [activeSheetId, setActiveSheetId] = useState(() => sheets[0]?.id || '');
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    labName: 'Arun Clinical Lab',
    labTagline: 'Diagnostics & pathology reporting',
    address: 'Main Road, Clinic Center',
    phone: '+91 98765 43210',
    email: 'contact@arunlab.com',
    letterheadSpacing: 0,
    footerSpacing: 0,
    metaBoxed: false,
    signatureImage: ''
  });
  const [previewReport, setPreviewReport] = useState(null);
  const [toast, setToast] = useState(null);
  const saveTimeoutRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Active sheet getter
  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  // Active template
  const activeTemplate = templates.find((t) => t.id === activeSheet?.templateId) || templates[0];

  // Load state on user change
  useEffect(() => {
    const storageKey = currentUser ? `${STORAGE_KEY_PREFIX}-${currentUser.id}` : `${STORAGE_KEY_PREFIX}-guest`;
    
    // 1. Try Local Storage
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed.templates) && parsed.templates.length) setTemplates(parsed.templates);
        if (Array.isArray(parsed.sheets) && parsed.sheets.length) {
          setSheets(parsed.sheets.map(recalculateSheetFormulas));
          setActiveSheetId(parsed.activeSheetId || parsed.sheets[0].id);
        }
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
        if (parsed.settings) setSettings((prev) => ({ ...prev, ...parsed.settings }));
      } catch (e) {
        console.warn('Failed to parse local state:', e);
      }
    }

    // 2. Try Supabase cloud state if authenticated
    if (supabaseClient && currentUser && currentUser.id !== 'guest' && currentUser.id !== 'offline-user') {
      supabaseClient
        .from('lab_app_state')
        .select('payload')
        .eq('owner_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data?.payload && !error) {
            const cloudState = data.payload;
            if (Array.isArray(cloudState.templates) && cloudState.templates.length) setTemplates(cloudState.templates);
            if (Array.isArray(cloudState.sheets) && cloudState.sheets.length) {
              setSheets(cloudState.sheets.map(recalculateSheetFormulas));
              setActiveSheetId(cloudState.activeSheetId || cloudState.sheets[0].id);
            }
            if (Array.isArray(cloudState.history)) setHistory(cloudState.history);
            if (cloudState.settings) setSettings((prev) => ({ ...prev, ...cloudState.settings }));
          }
        });
    }
  }, [currentUser, supabaseClient]);

  // Persist state (debounced)
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const storageKey = currentUser ? `${STORAGE_KEY_PREFIX}-${currentUser.id}` : `${STORAGE_KEY_PREFIX}-guest`;
      const stateToPersist = {
        sheets,
        activeSheetId,
        history,
        templates,
        settings,
        updatedAt: new Date().toISOString()
      };

      // Save locally
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateToPersist));
      } catch (e) {
        console.warn('localStorage quota exceeded:', e);
      }

      // Save to Supabase
      if (supabaseClient && currentUser && currentUser.id !== 'guest' && currentUser.id !== 'offline-user') {
        supabaseClient
          .from('lab_app_state')
          .upsert({
            id: `state-${currentUser.id}`,
            owner_id: currentUser.id,
            payload: stateToPersist,
            updated_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase sync warning:', error);
          });
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [sheets, activeSheetId, history, templates, settings, currentUser, supabaseClient]);

  // Tab operations
  const addSheet = () => {
    const newSheet = makeEmptySheet(activeTemplate);
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
    showToast('New report sheet opened');
  };

  const removeSheet = (sheetId) => {
    if (sheets.length <= 1) {
      const fresh = makeEmptySheet(activeTemplate);
      setSheets([fresh]);
      setActiveSheetId(fresh.id);
      return;
    }
    const filtered = sheets.filter((s) => s.id !== sheetId);
    setSheets(filtered);
    if (activeSheetId === sheetId) {
      setActiveSheetId(filtered[0].id);
    }
  };

  const updateActiveSheetPatient = (field, value) => {
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        return {
          ...sheet,
          patient: {
            ...sheet.patient,
            [field]: value
          }
        };
      })
    );
  };

  const updateActiveSheetActiveComponent = (componentId) => {
    setSheets((prev) =>
      prev.map((sheet) => (sheet.id === activeSheetId ? { ...sheet, activeComponentId: componentId } : sheet))
    );
  };

  const updateTestValue = (componentId, testId, value) => {
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updatedTests = sheet.tests.map((comp) => {
          if (comp.id !== componentId) return comp;
          const updatedSubtests = comp.tests.map((t) => (t.id === testId ? { ...t, value } : t));
          const withUpdated = { ...comp, tests: updatedSubtests };
          return recalculateComponentFormulas(withUpdated);
        });
        return { ...sheet, tests: updatedTests };
      })
    );
  };

  const toggleSection = (section) => {
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const exists = sheet.tests.some((comp) => comp.id === section.id);
        let nextTests;
        if (exists) {
          nextTests = sheet.tests.filter((comp) => comp.id !== section.id);
        } else {
          nextTests = [...sheet.tests, recalculateComponentFormulas(JSON.parse(JSON.stringify(section)))];
        }
        return {
          ...sheet,
          tests: nextTests,
          activeComponentId: nextTests[0]?.id || ''
        };
      })
    );
  };

  const toggleSubtest = (componentId, subtest) => {
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const updatedTests = sheet.tests.map((comp) => {
          if (comp.id !== componentId) return comp;
          const exists = comp.tests.some((t) => t.id === subtest.id);
          let newTests;
          if (exists) {
            newTests = comp.tests.filter((t) => t.id !== subtest.id);
          } else {
            newTests = [...comp.tests, { ...subtest, value: '' }];
          }
          return recalculateComponentFormulas({ ...comp, tests: newTests });
        });
        return { ...sheet, tests: updatedTests };
      })
    );
  };

  const moveSection = (sectionId, direction) => {
    setSheets((prev) => prev.map((sheet) => {
      if (sheet.id !== activeSheetId) return sheet;
      const index = sheet.tests.findIndex((section) => section.id === sectionId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= sheet.tests.length) return sheet;
      const nextTests = [...sheet.tests];
      [nextTests[index], nextTests[nextIndex]] = [nextTests[nextIndex], nextTests[index]];
      return { ...sheet, tests: nextTests };
    }));
  };

  const moveSubtest = (componentId, testId, direction) => {
    setSheets((prev) => prev.map((sheet) => {
      if (sheet.id !== activeSheetId) return sheet;
      return {
        ...sheet,
        tests: sheet.tests.map((component) => {
          if (component.id !== componentId) return component;
          const index = component.tests.findIndex((test) => test.id === testId);
          const nextIndex = index + direction;
          if (index < 0 || nextIndex < 0 || nextIndex >= component.tests.length) return component;
          const nextTests = [...component.tests];
          [nextTests[index], nextTests[nextIndex]] = [nextTests[nextIndex], nextTests[index]];
          return { ...component, tests: nextTests };
        })
      };
    }));
  };

  // History operations
  const saveActiveSheetToHistory = () => {
    if (!activeSheet) return;
    const totalTestsCount = activeSheet.tests.reduce((sum, c) => sum + (c.tests?.length || 0), 0);
    if (totalTestsCount === 0) {
      showToast('Add at least one test before saving to history');
      return;
    }

    const snapshot = {
      historyId: createId(),
      savedAt: new Date().toISOString(),
      templateName: activeTemplate.name,
      templateId: activeSheet.templateId,
      patient: JSON.parse(JSON.stringify(activeSheet.patient)),
      tests: JSON.parse(JSON.stringify(activeSheet.tests)),
      billing: JSON.parse(JSON.stringify(activeSheet.billing || {}))
    };

    setHistory((prev) => [snapshot, ...prev]);
    showToast(`Report saved for ${activeSheet.patient.name || 'Unnamed Patient'}`);
  };

  const deleteHistoryItem = (historyId) => {
    setHistory((prev) => prev.filter((h) => h.historyId !== historyId));
    showToast('Report deleted from history');
  };

  const restoreHistoryItem = (snapshot) => {
    const restoredSheet = {
      id: createId(),
      templateId: snapshot.templateId || activeTemplate.id,
      activeComponentId: snapshot.tests[0]?.id || '',
      patient: JSON.parse(JSON.stringify(snapshot.patient)),
      tests: JSON.parse(JSON.stringify(snapshot.tests)),
      billing: JSON.parse(JSON.stringify(snapshot.billing || {}))
    };
    setSheets((prev) => [...prev, restoredSheet]);
    setActiveSheetId(restoredSheet.id);
    setCurrentView('editor');
    showToast(`Loaded ${snapshot.patient.name || 'Report'} into Editor`);
  };

  const duplicateHistoryItem = (snapshot) => {
    const dup = {
      ...JSON.parse(JSON.stringify(snapshot)),
      historyId: createId(),
      savedAt: new Date().toISOString(),
      patient: {
        ...snapshot.patient,
        name: `${snapshot.patient.name || 'Patient'} (Copy)`,
        sampleCollectedAt: new Date().toISOString().slice(0, 16)
      }
    };
    setHistory((prev) => [dup, ...prev]);
    showToast('Report duplicated in history');
  };

  // Billing updates
  const updateActiveSheetBilling = (field, value) => {
    setSheets((prev) =>
      prev.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        return {
          ...sheet,
          billing: {
            ...sheet.billing,
            [field]: value
          }
        };
      })
    );
  };

  // Template CRUD
  const saveTemplate = (templateData) => {
    setTemplates((prev) => {
      const index = prev.findIndex((t) => t.id === templateData.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = templateData;
        return copy;
      }
      return [...prev, templateData];
    });
    showToast(`Template "${templateData.name}" saved`);
  };

  const deleteTemplate = (templateId) => {
    if (templates.length <= 1) {
      showToast('Cannot delete the only remaining template');
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    showToast('Template deleted');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        templates,
        sheets,
        activeSheet,
        activeSheetId,
        setActiveSheetId,
        activeTemplate,
        history,
        settings,
        setSettings,
        previewReport,
        setPreviewReport,
        toast,
        showToast,
        addSheet,
        removeSheet,
        updateActiveSheetPatient,
        updateActiveSheetActiveComponent,
        updateTestValue,
        toggleSection,
        toggleSubtest,
        moveSection,
        moveSubtest,
        saveActiveSheetToHistory,
        deleteHistoryItem,
        restoreHistoryItem,
        duplicateHistoryItem,
        updateActiveSheetBilling,
        saveTemplate,
        deleteTemplate
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
