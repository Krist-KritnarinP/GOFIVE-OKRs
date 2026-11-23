import { useState } from 'react';
import { AlertCircle, KeyRound, Languages } from 'lucide-react';
import { DEMO_PERSONAS } from '../constants/roles.js';

export function LoginPage({ t, lang, onToggleLanguage, onLogin, onGoRegister }) {
  const [employeeCode, setEmployeeCode] = useState('EMP-1001');
  const [password, setPassword] = useState('DemoPass123!');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = onLogin(employeeCode, password);
    if (!result.ok) {
      setError(result.error);
    }
  };

  const quickFill = (code) => {
    setEmployeeCode(code);
    setPassword('DemoPass123!');
    setError('');
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

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Login Form */}
          <section className="lg:col-span-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 sm:p-8 flex flex-col justify-between space-y-6">
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

          {/* Right: 4 Quick-Fill Demo Accounts */}
          <aside className="lg:col-span-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-[var(--ink-primary)]">{t.quickFillTitle}</h2>
            </div>

            <div className="space-y-2.5">
              {DEMO_PERSONAS.map((persona) => {
                const selected = employeeCode.toUpperCase() === persona.employeeCode;
                return (
                  <button
                    key={persona.userId}
                    type="button"
                    onClick={() => quickFill(persona.employeeCode)}
                    className={`w-full text-left rounded-md border p-3.5 transition-colors duration-150 cursor-pointer ${
                      selected
                        ? 'border-[var(--brand-primary)] bg-[var(--status-track-bg)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--ink-primary)]">
                        {lang === 'th' ? persona.labelTh : persona.label}
                      </span>
                      <code className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--ink-primary)] tabular-nums">
                        {persona.employeeCode}
                      </code>
                    </div>
                    <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                      {lang === 'th' ? persona.nameTh : persona.name} · {persona.department}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
