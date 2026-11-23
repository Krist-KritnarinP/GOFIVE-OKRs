import { ROLES } from './constants/roles.js';
import { AppShell } from './components/layout/AppShell.jsx';
import { ToastBar } from './components/common/ToastBar.jsx';
import { HrDashboardPage } from './pages/HrDashboardPage.jsx';
import { ManagerWorkspacePage } from './pages/ManagerWorkspacePage.jsx';
import { EmployeeWorkspacePage } from './pages/EmployeeWorkspacePage.jsx';
import { useLanguage } from './hooks/useLanguage.js';
import { usePerformanceStore } from './hooks/usePerformanceStore.js';

export function App() {
  const { lang, toggleLanguage, t } = useLanguage('en');
  const store = usePerformanceStore(t);

  return (
    <AppShell
      t={t}
      lang={lang}
      cycle={store.cycle}
      activeRole={store.activeRole}
      onSelectRole={store.setActiveRole}
      onToggleLanguage={toggleLanguage}
    >
      {store.activeRole === ROLES.HR_ADMIN && (
        <HrDashboardPage
          cycle={store.cycle}
          reviews={store.reviews}
          auditLogs={store.auditLogs}
          analytics={store.analytics}
          t={t}
          lang={lang}
          onToggleGracePeriod={store.handleToggleGracePeriod}
          onToggleLockCycle={store.handleToggleLockCycle}
          onNudge={store.handleNudge}
          onExtendDeadline={store.handleExtendDeadline}
          onEscalate={store.handleEscalate}
          onPublishReady={store.handlePublishReady}
          onSaveEvaluation={store.handleSaveManagerEvaluation}
        />
      )}

      {store.activeRole === ROLES.MANAGER && (
        <ManagerWorkspacePage
          reviews={store.reviews}
          analytics={store.analytics}
          activeManagerId={store.activeManagerId}
          onSelectManager={store.setActiveManagerId}
          t={t}
          lang={lang}
          onSaveEvaluation={store.handleSaveManagerEvaluation}
        />
      )}

      {store.activeRole === ROLES.EMPLOYEE && (
        <EmployeeWorkspacePage
          key={store.activeEmployeeId}
          reviews={store.reviews}
          activeEmployeeId={store.activeEmployeeId}
          onSelectEmployee={store.setActiveEmployeeId}
          t={t}
          lang={lang}
          onSubmitSelfReview={store.handleSubmitSelfReview}
        />
      )}

      <ToastBar toast={store.toast} onDismiss={store.dismissToast} />
    </AppShell>
  );
}

export default App;
