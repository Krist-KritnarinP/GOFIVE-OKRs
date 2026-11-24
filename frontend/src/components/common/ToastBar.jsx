import { useEffect } from 'react';
import { X } from 'lucide-react';

const ACCENT_BAR = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export function ToastBar({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const barColor = ACCENT_BAR[toast.tone] || ACCENT_BAR.success;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-50 max-w-md flex items-center justify-between gap-4 rounded-md px-4 py-3 text-sm font-medium shadow-md"
      style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderLeft: `4px solid ${barColor}`,
      }}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="inline-flex items-center justify-center w-10 h-10 rounded hover:bg-slate-800 text-white transition-colors duration-150 ease-out cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
