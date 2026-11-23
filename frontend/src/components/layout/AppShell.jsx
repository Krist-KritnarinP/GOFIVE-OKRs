import { Languages, ShieldCheck } from 'lucide-react';

export function AppShell({ t, lang, onToggleLanguage, children }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[var(--brand-primary)] text-white shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <span className="text-lg font-bold tracking-tight text-[var(--ink-primary)]">
                {t.appName}
              </span>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
                {t.moduleBadge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center text-sm font-medium text-[var(--ink-secondary)] px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
              {t.cycleLabel}
            </span>
            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
              className="inline-flex items-center gap-2 min-h-11 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 ease-out cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}
