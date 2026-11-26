import { Suspense, lazy, useEffect } from 'react';
import { ROLES } from './constants/roles.js';
import { AppShell } from './components/layout/AppShell.jsx';
import { ToastBar } from './components/common/ToastBar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { useLanguage } from './hooks/useLanguage.js';
import { usePerformanceStore } from './hooks/usePerformanceStore.js';

const RegisterPage = lazy(() =>
  import('./pages/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage }))
);
const DemoRolePickerPage = lazy(() =>
  import('./pages/DemoRolePickerPage.jsx').then((m) => ({ default: m.DemoRolePickerPage }))
);
const SuperAdminPage = lazy(() =>
  import('./pages/SuperAdminPage.jsx').then((m) => ({ default: m.SuperAdminPage }))
);
const HrDashboardPage = lazy(() =>
  import('./pages/HrDashboardPage.jsx').then((m) => ({ default: m.HrDashboardPage }))
);
const ManagerWorkspacePage = lazy(() =>
  import('./pages/ManagerWorkspacePage.jsx').then((m) => ({ default: m.ManagerWorkspacePage }))
);
const EmployeeWorkspacePage = lazy(() =>
  import('./pages/EmployeeWorkspacePage.jsx').then((m) => ({ default: m.EmployeeWorkspacePage }))
);

function WorkspaceFallback() {
  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center p-6 text-sm font-semibold text-(--ink-secondary)">
      Loading workspace…
    </div>
  );
}

export function App() {
  const { lang, toggleLanguage, t } = useLanguage('en');
  const store = usePerformanceStore(t);

  // Sync SPA document title per view (modern-web-guidance: accessibility §4)
  useEffect(() => {
    const pageName = !store.currentUser
      ? store.authScreen === 'register'
        ? t.registerTitle
        : store.authScreen === 'demo-picker'
          ? t.demoPickerTitle
          : t.loginTitle
      : store.activeRole === ROLES.SUPER_ADMIN
        ? t.superTitle
        : store.activeRole === ROLES.HR_ADMIN
          ? t.hrTitle
          : store.activeRole === ROLES.MANAGER
            ? t.mgrTitle
            : t.empTitle;
    document.title = `${pageName} | ${t.appName}`;
  }, [store.currentUser, store.authScreen, store.activeRole, t]);

  if (!store.currentUser) {
    if (store.authScreen === 'demo-picker') {
      return (
        <>
          <Suspense fallback={<WorkspaceFallback />}>
            <DemoRolePickerPage
              users={store.users}
              reviews={store.reviews}
              t={t}
              lang={lang}
              onToggleLanguage={toggleLanguage}
              onEnterAsUser={store.handleEnterAsUser}
              onBackToLogin={() => store.setAuthScreen('login')}
              onResetDemo={store.handleResetDemo}
            />
          </Suspense>
          <ToastBar toast={store.toast} onDismiss={store.dismissToast} t={t} />
        </>
      );
    }
    return store.authScreen === 'register' ? (
      <>
        <Suspense fallback={<WorkspaceFallback />}>
          <RegisterPage
            t={t}
            onToggleLanguage={toggleLanguage}
            onActivateInvite={store.handleActivateInvite}
            onRegister={store.handleRegister}
            onBackToLogin={() => store.setAuthScreen('login')}
          />
        </Suspense>
        <ToastBar toast={store.toast} onDismiss={store.dismissToast} t={t} />
      </>
    ) : (
      <>
        <LoginPage
          t={t}
          onToggleLanguage={toggleLanguage}
          onLogin={store.handleLogin}
          onBypassDemo={store.handleBypassDemo}
          onGoRegister={() => store.setAuthScreen('register')}
        />
        <ToastBar toast={store.toast} onDismiss={store.dismissToast} t={t} />
      </>
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
      onResetDemo={store.handleResetDemo}
      onToggleLanguage={toggleLanguage}
      onLogout={store.handleLogout}
    >
      <Suspense fallback={<WorkspaceFallback />}>
        {store.activeRole === ROLES.SUPER_ADMIN && (
          <SuperAdminPage
            users={store.users}
            rolePermissions={store.rolePermissions}
            auditLogs={store.auditLogs}
            t={t}
            lang={lang}
            onInviteUser={store.handleInviteUser}
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
            currentUser={store.currentUser}
            can={store.can}
            t={t}
            lang={lang}
            onUpdateStageDeadlines={store.handleUpdateStageDeadlines}
            onToggleGracePeriod={store.handleToggleGracePeriod}
            onToggleLockCycle={store.handleToggleLockCycle}
            onNudge={store.handleNudge}
            onExtendDeadline={store.handleExtendDeadline}
            onEscalate={store.handleEscalate}
            onPostHrbpAdvisorComment={store.handlePostHrbpAdvisorComment}
            onHrReturnToManager={store.handleHrReturnToManager}
            onDecideGoalAmendment={store.handleDecideGoalAmendment}
            onPublishReady={store.handlePublishReady}
          />
        )}

        {store.activeRole === ROLES.MANAGER && (
          <ManagerWorkspacePage
            cycle={store.cycle}
            reviews={store.reviews}
            auditLogs={store.auditLogs}
            analytics={store.analytics}
            activeManagerId={store.activeManagerId}
            onSelectManager={store.setActiveManagerId}
            t={t}
            lang={lang}
            onDecideGoals={store.handleDecideEmployeeGoals}
            onReturnToEmployee={store.handleReturnReviewToEmployee}
            onRequestGoalAmendment={store.handleRequestGoalAmendment}
            onSaveEvaluation={store.handleSaveManagerEvaluation}
          />
        )}

        {store.activeRole === ROLES.EMPLOYEE && (
          <EmployeeWorkspacePage
            key={store.activeEmployeeId}
            cycle={store.cycle}
            reviews={store.reviews}
            auditLogs={store.auditLogs}
            activeEmployeeId={store.activeEmployeeId}
            onSelectEmployee={store.setActiveEmployeeId}
            t={t}
            lang={lang}
            onSubmitGoals={store.handleSubmitEmployeeGoals}
            onSubmitSelfReview={store.handleSubmitSelfReview}
            onNotify={store.showToast}
          />
        )}
      </Suspense>

      <ToastBar toast={store.toast} onDismiss={store.dismissToast} t={t} />
    </AppShell>
  );
}

export default App;
