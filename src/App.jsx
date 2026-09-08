import React from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useApp } from './context/AppContext.jsx';
import { Topbar } from './components/Header/Topbar.jsx';
import { AuthOverlay } from './components/Auth/AuthOverlay.jsx';
import { TabBar } from './components/Editor/TabBar.jsx';
import { PatientForm } from './components/Editor/PatientForm.jsx';
import { TestSectionsPanel } from './components/Editor/TestSectionsPanel.jsx';
import { TestCard } from './components/Editor/TestCard.jsx';
import { HistoryView } from './components/History/HistoryView.jsx';
import { TemplatesView } from './components/Templates/TemplatesView.jsx';
import { PaymentsView } from './components/Payments/PaymentsView.jsx';
import { SettingsView } from './components/Settings/SettingsView.jsx';
import { PrintPreviewModal } from './components/Print/PrintPreviewModal.jsx';
import { Toast } from './components/Common/Toast.jsx';

export function App() {
  const { isUnlocked } = useAuth();
  const { currentView, activeSheet } = useApp();

  return (
    <div className={`app-shell ${!isUnlocked ? 'auth-locked' : ''}`}>
      <Topbar />

      {currentView === 'editor' && (
        <>
          <TabBar />
          <main className="content-grid">
            <section className="editor-card">
              <PatientForm />
              <div className="tests-container" style={{ marginTop: '20px' }}>
                {activeSheet?.tests?.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                    <p className="muted-text">No test groups selected. Check test groups from the catalog on the right to add them.</p>
                  </div>
                ) : (
                  activeSheet?.tests?.map((component) => (
                    <TestCard key={component.id} component={component} />
                  ))
                )}
              </div>
            </section>

            <aside className="sidebar">
              <TestSectionsPanel />
            </aside>
          </main>
        </>
      )}

      {currentView === 'history' && <HistoryView />}
      {currentView === 'templates' && <TemplatesView />}
      {currentView === 'payments' && <PaymentsView />}
      {currentView === 'settings' && <SettingsView />}

      <PrintPreviewModal />
      <AuthOverlay />
      <Toast />
    </div>
  );
}
export default App;
