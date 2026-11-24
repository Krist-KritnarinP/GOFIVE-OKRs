import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export function ReasonModal({
  isOpen,
  title,
  subtitle,
  quickTemplateLabel = '',
  quickTemplateText = '',
  t,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError(t.reasonPlaceholder);
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--backdrop-overlay)' }}
    >
      <div className="w-full max-w-lg rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card)] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--ink-primary)]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {quickTemplateText && (
          <div
            className="rounded-md border p-3 space-y-2"
            style={{
              backgroundColor: 'var(--status-indigo-bg)',
              borderColor: 'var(--status-indigo-border)',
            }}
          >
            <p className="text-xs font-bold" style={{ color: 'var(--status-indigo-text)' }}>
              {quickTemplateLabel}
            </p>
            <button
              type="button"
              onClick={() => {
                setReason(quickTemplateText);
                setError('');
              }}
              className="inline-flex items-start gap-2 text-left text-xs font-medium text-[var(--ink-primary)] hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--status-indigo-text)' }} aria-hidden="true" />
              <span>&ldquo;{quickTemplateText}&rdquo;</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="audit-reason" className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.reasonLabel}
            </label>
            <textarea
              id="audit-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.reasonPlaceholder}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
            />
            {error && (
              <p className="text-sm font-medium" style={{ color: 'var(--status-low-text)' }}>
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 ease-out cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-11 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white transition-colors duration-150 ease-out cursor-pointer"
            >
              {t.confirmBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
