import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const TONE_STYLES = {
  action: {
    bg: 'var(--status-track-bg)',
    border: 'var(--status-track-border)',
    accent: 'var(--status-track-accent)',
    text: 'var(--status-track-text)',
    Icon: Sparkles,
  },
  warn: {
    bg: 'var(--status-warn-bg)',
    border: 'var(--status-warn-border)',
    accent: 'var(--status-warn-accent)',
    text: 'var(--status-warn-text)',
    Icon: Clock,
  },
  done: {
    bg: 'var(--status-high-bg)',
    border: 'var(--status-high-border)',
    accent: 'var(--status-high-accent)',
    text: 'var(--status-high-text)',
    Icon: CheckCircle2,
  },
};

/**
 * Single plain-language "Your Turn" Banner — removes guesswork for first-time
 * and non-IT users by stating clearly whether action is needed right now.
 */
export function NextActionBanner({
  tone = 'action',
  badgeLabel,
  message,
  ctaLabel = '',
  onCta = null,
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.action;
  const Icon = style.Icon;

  return (
    <section
      aria-label={badgeLabel}
      className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        borderLeftWidth: '4px',
        borderLeftColor: style.accent,
      }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-md shrink-0 mt-0.5"
          style={{
            backgroundColor: 'var(--surface-card)',
            color: style.text,
            border: `1px solid ${style.border}`,
          }}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: style.text }}>
            {badgeLabel}
          </p>
          <p className="text-sm sm:text-base font-semibold text-(--ink-primary) leading-snug">
            {message}
          </p>
        </div>
      </div>

      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) active:scale-98 text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer shrink-0"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
