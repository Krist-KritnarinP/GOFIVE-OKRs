import { useState } from 'react';
import { AlertCircle, CheckCircle2, Languages } from 'lucide-react';

export function RegisterPage({ t, onToggleLanguage, onRegister, onBackToLogin }) {
  const [form, setForm] = useState({
    employeeCode: 'EMP-4001',
    name: '',
    department: 'Engineering',
    title: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submittedUser, setSubmittedUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!/^[A-Z]{2,6}-\d{3,6}$/i.test(form.employeeCode.trim())) {
      setError('Employee code format must be e.g. EMP-4001');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const res = onRegister(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSubmittedUser(res.user);
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
        <section className="w-full max-w-xl rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 sm:p-8 space-y-6">
          {submittedUser ? (
            <div className="space-y-4">
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-md border"
                style={{
                  backgroundColor: 'var(--status-warn-bg)',
                  color: 'var(--status-warn-text)',
                  borderColor: 'var(--status-warn-border)',
                }}
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </span>
              <h1 className="text-xl font-bold text-[var(--ink-primary)]">{t.registerSuccessTitle}</h1>
              <p className="text-sm sm:text-base text-[var(--ink-secondary)]">
                <strong>{submittedUser.employeeCode}</strong> ({submittedUser.name}) — {t.registerSuccessDesc}
              </p>
              <button
                type="button"
                onClick={onBackToLogin}
                className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white transition-colors duration-150 cursor-pointer"
              >
                {t.backToLogin}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-[var(--ink-primary)]">{t.registerTitle}</h1>
                <p className="text-sm text-[var(--ink-secondary)]">{t.registerSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                      {t.empCodeLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.employeeCode}
                      onChange={(e) => setForm((p) => ({ ...p, employeeCode: e.target.value }))}
                      placeholder="EMP-4001"
                      className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] uppercase tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                      {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                      {t.departmentLabel}
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                      {t.jobTitleLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                    {t.passwordLabel} (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
                  />
                </div>

                {error && (
                  <div
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

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
                  >
                    {t.backToLogin}
                  </button>
                  <button
                    type="submit"
                    className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
                  >
                    {t.registerBtn}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
