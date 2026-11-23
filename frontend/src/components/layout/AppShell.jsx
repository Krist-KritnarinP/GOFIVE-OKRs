import { Languages, Lock, ShieldCheck } from 'lucide-react';
import { DEMO_PERSONAS } from '../../constants/roles.js';
import { StatusBadge } from '../common/StatusBadge.jsx';

export function AppShell({
  t,
  lang,
  cycle,
  activeRole,
  onSelectRole,
  onToggleLanguage,
  children,
}) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Active Cycle */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[var(--brand-primary)] text-white shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold tracking-tight text-[var(--ink-primary)]">
                {t.appName}
              </span>
              <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
                {t.moduleBadge}
              </span>
              <span className="hidden xl:inline-flex items-center text-sm font-medium text-[var(--ink-secondary)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                {lang === 'th' ? cycle.nameTh : cycle.name}
              </span>
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
          </div>

          {/* Right: 1-Click Role Switcher + EN/TH Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <nav
              aria-label={t.roleSwitcherLabel}
              className="inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] p-0.5"
            >
              {DEMO_PERSONAS.map((persona) => {
                const isActive = activeRole === persona.role;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => onSelectRole(persona.role)}
                    className={`min-h-10 px-3 rounded text-sm font-semibold transition-colors duration-150 ease-out cursor-pointer ${
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
              onClick={onToggleLanguage}
              aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 ease-out cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
