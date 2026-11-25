import { useId, useRef, useState } from 'react';
import { AlertCircle, CalendarPlus, Sparkles, X } from 'lucide-react';
import { ModalDialog } from './ModalDialog.jsx';

const EXTEND_PRESETS = [2, 5, 7];

export function ReasonModal({
  isOpen,
  title,
  subtitle,
  confirmLabel = '',
  quickTemplateLabel = '',
  quickTemplateText = '',
  showExtendDays = false,
  defaultExtendDays = 5,
  t,
  onClose,
  onConfirm,
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const inputId = `${uid}-reason`;
  const daysId = `${uid}-days`;
  const errorId = `${uid}-error`;
  const textareaRef = useRef(null);
  const [reason, setReason] = useState('');
  const [extraDays, setExtraDays] = useState(defaultExtendDays);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const trimmedLen = reason.trim().length;
  const clampedDays = Math.min(30, Math.max(1, Number(extraDays) || 1));
  const previewDate = new Date(Date.now() + clampedDays * 86400000).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trimmedLen < 5) {
      const msg = (t.errReasonTooShort || 'Enter at least 5 characters ({n}/5).').replace(
        '{n}',
        String(trimmedLen)
      );
      setError(msg);
      textareaRef.current?.focus();
      return;
    }
    onConfirm(reason.trim(), clampedDays);
    setReason('');
    setExtraDays(defaultExtendDays);
    setError('');
  };

  return (
    <ModalDialog isOpen={isOpen} labelledBy={titleId} variant="center" maxWidthClass="max-w-lg" onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 id={titleId} className="text-lg font-bold text-(--ink-primary)">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-(--ink-secondary)">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-(--border-subtle) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer shrink-0"
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
              className="inline-flex items-start gap-2 text-left text-xs font-medium text-(--ink-primary) hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--status-indigo-text)' }} aria-hidden="true" />
              <span>&ldquo;{quickTemplateText}&rdquo;</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {showExtendDays && (
            <div className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor={daysId} className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--ink-primary)">
                  <CalendarPlus className="w-4 h-4 text-(--brand-primary)" aria-hidden="true" />
                  <span>{t.extendDaysLabel}</span>
                </label>
                <span className="text-xs font-semibold text-(--ink-secondary) tabular-nums">
                  {t.newDuePreviewLabel}: <strong className="text-(--ink-primary)">{previewDate}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {EXTEND_PRESETS.map((d) => {
                  const active = clampedDays === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtraDays(d)}
                      aria-pressed={active}
                      className={`min-h-9 px-3 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer tabular-nums ${
                        active
                          ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                          : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                      }`}
                    >
                      +{d} {t.daysUnit}
                    </button>
                  );
                })}
                <div className="inline-flex items-center gap-1.5 ml-auto">
                  <input
                    id={daysId}
                    type="number"
                    min={1}
                    max={30}
                    value={extraDays}
                    onChange={(e) => setExtraDays(e.target.value)}
                    className="w-20 min-h-9 rounded-md border border-(--border-strong) bg-(--surface-card) px-2.5 text-sm font-semibold text-(--ink-primary) tabular-nums"
                  />
                  <span className="text-xs font-semibold text-(--ink-secondary)">{t.daysUnit}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={inputId} className="block text-sm font-semibold text-(--ink-primary)">
                {t.reasonLabel}
              </label>
              <span className="text-xs font-medium text-(--ink-muted) tabular-nums">
                {trimmedLen}/5+ {t.charsUnit}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id={inputId}
              name="reason"
              rows={3}
              autoFocus
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.reasonPlaceholder}
              className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
            />
            {error && (
              <div
                id={errorId}
                role="alert"
                className="flex items-start gap-2 rounded-md border p-2.5 text-xs sm:text-sm font-semibold"
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
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) active:scale-98 text-sm font-semibold text-(--ink-primary) transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) active:scale-98 text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {confirmLabel || t.confirmBtn}
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
}
