import { useState } from 'react';
import { AlertCircle, Languages, Sparkles } from 'lucide-react';

export function LoginPage({
  t,
  onToggleLanguage,
  onLogin,
  onBypassDemo,
  onGoRegister,
}) {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = onLogin(employeeCode, password);
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-[var(--ink-primary)]">
              {t.appName}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
              {t.moduleBadge}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
            <span>{t.switchLanguage}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-8 flex items-center justify-center">
        <section className="w-full max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              {t.loginTitle}
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-secondary)]">{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-emp-code" className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.empCodeLabel}
              </label>
              <input
                id="login-emp-code"
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder={t.empCodePlaceholder}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3.5 text-base text-[var(--ink-primary)] uppercase tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.passwordLabel}
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3.5 text-base text-[var(--ink-primary)]"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border p-3 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--status-low-bg)',
                  color: 'var(--status-low-text)',
                  borderColor: 'var(--status-low-border)',
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-11 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm sm:text-base font-semibold text-white transition-colors duration-150 cursor-pointer"
            >
              {t.signInBtn}
            </button>
          </form>

          {/* Gold Bypass Demo Section */}
          <div className="pt-5 border-t border-[var(--border-subtle)] space-y-3">
            <button
              type="button"
              onClick={onBypassDemo}
              className="w-full min-h-12 px-4 rounded-md inline-flex items-center justify-center gap-2 text-base font-extrabold tracking-tight transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: '#F59E0B',
                color: '#0F172A',
                border: '1px solid #B45309',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B';
              }}
            >
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.bypassDemoBtn}</span>
            </button>
            <p className="text-xs text-center font-medium text-[var(--ink-secondary)]">
              {t.bypassDemoSub}
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-sm">
            <span className="text-[var(--ink-secondary)]">{t.noAccountText}</span>
            <button
              type="button"
              onClick={onGoRegister}
              className="font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
            >
              {t.goToRegister}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
