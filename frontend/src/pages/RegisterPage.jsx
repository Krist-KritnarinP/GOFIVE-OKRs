import { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Languages } from 'lucide-react';
import { TieredSelect } from '../components/common/TieredSelect.jsx';

const DEPARTMENT_OPTIONS = [
  { value: 'Engineering', label: 'Engineering', tone: 'track' },
  { value: 'Product', label: 'Product', tone: 'indigo' },
  { value: 'Sales', label: 'Sales', tone: 'high' },
  { value: 'Operations', label: 'Operations', tone: 'warn' },
  { value: 'Human Resources', label: 'Human Resources', tone: 'neutral' },
];

export function RegisterPage({ t, onToggleLanguage, onRegister, onBackToLogin }) {
  const uid = useId();
  const [form, setForm] = useState({
    employeeCode: 'EMP-4001',
    name: '',
    department: 'Engineering',
    title: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submittedUser, setSubmittedUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!/^[A-Z]{2,6}-\d{3,6}$/i.test(form.employeeCode.trim())) {
      setError(t.regErrCodeFormat || 'Employee code format must be e.g. EMP-4001.');
      return;
    }
    if (form.password.length < 8) {
      const msg = (t.regErrPasswordMin || 'Password must be at least 8 characters ({n}/8 entered).').replace(
        '{n}',
        String(form.password.length)
      );
      setError(msg);
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
    <div className="min-h-screen w-full flex flex-col bg-(--surface-page) text-(--ink-primary)">
      <header className="w-full border-b border-(--border-subtle) bg-(--surface-card)">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-(--ink-primary)">
              {t.appName}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-(--ink-secondary)">
              {t.moduleBadge}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-(--ink-secondary)" aria-hidden="true" />
            <span>{t.switchLanguage}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-8 flex items-center justify-center">
        <section className="w-full max-w-xl rounded-lg border border-(--border-subtle) bg-(--surface-card) p-6 sm:p-8 space-y-6">
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
              <h1 className="text-xl font-bold text-(--ink-primary)">{t.registerSuccessTitle}</h1>
              <p className="text-sm sm:text-base text-(--ink-secondary)">
                <strong>{submittedUser.employeeCode}</strong> ({submittedUser.name}) — {t.registerSuccessDesc}
              </p>
              <button
                type="button"
                onClick={onBackToLogin}
                className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white transition-colors duration-150 cursor-pointer"
              >
                {t.backToLogin}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-(--ink-primary)">{t.registerTitle}</h1>
                <p className="text-sm text-(--ink-secondary)">{t.registerSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`${uid}-code`} className="block text-sm font-semibold text-(--ink-primary)">
                      {t.empCodeLabel}
                    </label>
                    <input
                      id={`${uid}-code`}
                      name="employeeCode"
                      type="text"
                      required
                      aria-invalid={error ? 'true' : 'false'}
                      autoComplete="username"
                      autoCorrect="off"
                      spellCheck={false}
                      value={form.employeeCode}
                      onChange={(e) => setForm((p) => ({ ...p, employeeCode: e.target.value }))}
                      placeholder="EMP-4001"
                      className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-base text-(--ink-primary) uppercase tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`${uid}-name`} className="block text-sm font-semibold text-(--ink-primary)">
                      {t.fullNameLabel}
                    </label>
                    <input
                      id={`${uid}-name`}
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-base text-(--ink-primary)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`${uid}-dept`} className="block text-sm font-semibold text-(--ink-primary)">
                      {t.departmentLabel}
                    </label>
                    <TieredSelect
                      id={`${uid}-dept`}
                      name="department"
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      className="w-full min-h-11"
                      options={DEPARTMENT_OPTIONS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`${uid}-title`} className="block text-sm font-semibold text-(--ink-primary)">
                      {t.jobTitleLabel}
                    </label>
                    <input
                      id={`${uid}-title`}
                      name="title"
                      type="text"
                      required
                      autoComplete="organization-title"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-base text-(--ink-primary)"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${uid}-pwd`} className="block text-sm font-semibold text-(--ink-primary)">
                    {t.passwordLabel}
                  </label>
                  <p id={`${uid}-pwd-hint`} className="text-xs text-(--ink-muted)">
                    {t.passwordHint || 'At least 8 characters.'}
                  </p>
                  <div className="relative flex items-center">
                    <input
                      id={`${uid}-pwd`}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      aria-invalid={error ? 'true' : 'false'}
                      autoComplete="new-password"
                      aria-describedby={`${uid}-pwd-hint`}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) pl-3 pr-12 text-base text-(--ink-primary)"
                    />
                    <button
                      type="button"
                      aria-pressed={showPassword}
                      aria-label={showPassword ? (t.hidePasswordLabel || 'Hide password') : (t.showPasswordLabel || 'Show password')}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-1 inline-flex items-center justify-center w-10 h-10 rounded-md text-(--ink-secondary) hover:bg-(--surface-hover) cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
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

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
                  >
                    {t.backToLogin}
                  </button>
                  <button
                    type="submit"
                    className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) active:scale-98 text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
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
