import { ROLES } from './constants/roles.js';
import { AppShell } from './components/layout/AppShell.jsx';
import { ToastBar } from './components/common/ToastBar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DemoRolePickerPage } from './pages/DemoRolePickerPage.jsx';
import { SuperAdminPage } from './pages/SuperAdminPage.jsx';
import { HrDashboardPage } from './pages/HrDashboardPage.jsx';
import { ManagerWorkspacePage } from './pages/ManagerWorkspacePage.jsx';
import { EmployeeWorkspacePage } from './pages/EmployeeWorkspacePage.jsx';
import { useLanguage } from './hooks/useLanguage.js';
import { usePerformanceStore } from './hooks/usePerformanceStore.js';

export function App() {
  const { lang, toggleLanguage, t } = useLanguage('en');
  const store = usePerformanceStore(t);

  if (!store.currentUser) {
    if (store.authScreen === 'demo-picker') {
      return (
        <DemoRolePickerPage
          users={store.users}
          reviews={store.reviews}
          t={t}
          lang={lang}
          onToggleLanguage={toggleLanguage}
          onEnterAsUser={store.handleEnterAsUser}
          onBackToLogin={() => store.setAuthScreen('login')}
        />
      );
    }
    return store.authScreen === 'register' ? (
      <RegisterPage
        t={t}
        onToggleLanguage={toggleLanguage}
        onRegister={store.handleRegister}
        onBackToLogin={() => store.setAuthScreen('login')}
      />
    ) : (
      <LoginPage
        t={t}
        lang={lang}
        onToggleLanguage={toggleLanguage}
        onLogin={store.handleLogin}
        onBypassDemo={store.handleBypassDemo}
        onGoRegister={() => store.setAuthScreen('register')}
      />
    );
  }

  return (
    <AppShell
      t={t}
      lang={lang}
      cycle={store.cycle}
      currentUser={store.currentUser}
      activeRole={store.activeRole}
      onSelectRole={store.setActiveRole}
      onOpenDemoPicker={store.handleBypassDemo}
      onToggleLanguage={toggleLanguage}
      onLogout={store.handleLogout}
    >
      {store.activeRole === ROLES.SUPER_ADMIN && (
        <SuperAdminPage
          users={store.users}
          rolePermissions={store.rolePermissions}
          auditLogCount={store.auditLogs.length}
          t={t}
          lang={lang}
          onUpdateUser={store.handleUpdateUser}
          onTogglePermission={store.handleTogglePermission}
        />
      )}

      {store.activeRole === ROLES.HR_ADMIN && (
        <HrDashboardPage
          cycle={store.cycle}
          reviews={store.reviews}
          auditLogs={store.auditLogs}
          analytics={store.analytics}
          can={store.can}
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
