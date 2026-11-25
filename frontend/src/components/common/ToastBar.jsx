import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const TONE_META = {
  success: { bar: '#10B981', Icon: CheckCircle2, durationMs: 4500 },
  warning: { bar: '#F59E0B', Icon: AlertTriangle, durationMs: 6000 },
  error: { bar: '#EF4444', Icon: AlertCircle, durationMs: 6500 },
};

/**
 * Accessible persistent toast region (modern-web-guidance: persistent-toast-notifications).
 * - Keeps the named notification region and live region mounted from initial load.
 * - Uses native `document.ariaNotify()` when supported, with ARIA live-region fallback.
 * - Pauses auto-dismiss while hovered or keyboard-focused inside the toast.
 */
export function ToastBar({ toast, onDismiss, t }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!toast?.message) return;
    if (typeof document !== 'undefined' && typeof document.ariaNotify === 'function') {
      try {
        document.ariaNotify(toast.message, {
          priority: toast.tone === 'error' ? 'high' : 'normal',
        });
      } catch {
        // Fallback live region below still announces the message.
      }
    }
  }, [toast]);

  useEffect(() => {
    if (!toast || paused) return undefined;
    const meta = TONE_META[toast.tone] || TONE_META.success;
    const timer = window.setTimeout(onDismiss, meta.durationMs);
    return () => window.clearTimeout(timer);
  }, [toast, paused, onDismiss]);

  const meta = toast ? TONE_META[toast.tone] || TONE_META.success : TONE_META.success;
  const Icon = meta.Icon;

  return (
    <div
      role="region"
      aria-label={t?.notificationsRegionLabel || 'Notifications'}
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:left-5 z-50 pointer-events-none flex flex-col items-stretch sm:items-start gap-2"
    >
      {/* Persistent polite/assertive live regions mounted on page load for assistive tech */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {toast && toast.tone !== 'error' ? toast.message : ''}
      </div>
      <div className="visually-hidden" aria-live="assertive" aria-atomic="true">
        {toast && toast.tone === 'error' ? toast.message : ''}
      </div>

      {toast && (
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="pointer-events-auto w-full sm:max-w-md flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-md"
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderLeft: `4px solid ${meta.bar}`,
          }}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: meta.bar }} aria-hidden="true" />
            <span className="leading-snug break-words">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t?.dismissNotificationLabel || 'Dismiss notification'}
            className="inline-flex items-center justify-center w-10 h-10 rounded hover:bg-slate-800 text-white transition-colors duration-150 ease-out cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
