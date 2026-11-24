import { Languages, Lock, LogOut, Users } from 'lucide-react';
import { DEMO_PERSONAS } from '../../constants/roles.js';
import { StatusBadge } from '../common/StatusBadge.jsx';

export function AppShell({
  t,
  lang,
  cycle,
  currentUser,
  activeRole,
  onSelectRole,
  onOpenDemoPicker,
  onToggleLanguage,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      {/* Skip link for keyboard navigation (modern-web-guidance: accessibility §1) */}
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white"
      >
        {t.skipToMain || 'Skip to main content'}
      </a>

      <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Text-only Wordmark, Cycle & Logged-in Employee Code */}
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <span className="text-xl font-extrabold tracking-tight text-[var(--ink-primary)]">
              {t.appName}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
              {t.moduleBadge}
            </span>
            {currentUser && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-primary)] tabular-nums">
                {currentUser.employeeCode} · {lang === 'th' ? currentUser.nameTh : currentUser.name}
              </span>
            )}
            {cycle.isLocked && (
              <StatusBadge tone="low">
                <Lock className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                {t.status.LOCKED}
              </StatusBadge>
            )}
            {cycle.isGracePeriodActive && (
              <StatusBadge tone="warn">{t.status.GRACE}</StatusBadge>
            )}
          </div>

          {/* Right: 1-Click Demo Role Switcher + EN/TH + Sign Out */}
          <div className="flex items-center gap-2 flex-wrap">
            <nav
              aria-label={t.roleSwitcherLabel}
              className="inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] p-0.5 flex-wrap"
            >
              {DEMO_PERSONAS.map((persona) => {
                const isActive = activeRole === persona.role;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelectRole(persona.role)}
                    className={`min-h-10 px-2.5 rounded text-xs sm:text-sm font-semibold transition-colors duration-150 ease-out cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'bg-transparent text-[var(--ink-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {lang === 'th' ? persona.labelTh : persona.label}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={onOpenDemoPicker}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border text-xs sm:text-sm font-bold transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: 'var(--status-warn-bg)',
                color: 'var(--status-warn-text)',
                borderColor: 'var(--status-warn-border)',
              }}
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>{t.switchDemoUserBtn}</span>
            </button>

            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
              <span>{t.logoutBtn}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-full min-w-0 overflow-x-clip px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
