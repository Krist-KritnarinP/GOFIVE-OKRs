import { Languages, ShieldCheck } from 'lucide-react';

export function AppShell({ t, lang, onToggleLanguage, children }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]/95 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--accent-primary)] text-white shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <span className="text-lg font-bold tracking-tight">{t.appName}</span>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--ink-secondary)]">
                {t.moduleBadge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center text-sm text-[var(--ink-muted)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
              {t.cycleLabel}
            </span>
            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
              className="inline-flex items-center gap-2 min-h-11 px-3.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-muted)] text-sm font-semibold text-[var(--ink-primary)] transition-colors cursor-pointer"
            >
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
