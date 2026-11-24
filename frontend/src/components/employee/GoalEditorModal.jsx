import { useState } from 'react';
import { X } from 'lucide-react';

export function GoalEditorModal({ isOpen, initialGoal, t, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: initialGoal?.id || `g-${Date.now()}`,
    title: initialGoal?.title || '',
    titleTh: initialGoal?.titleTh || '',
    metricType: initialGoal?.metricType || 'QUANTITATIVE',
    targetValue: initialGoal?.targetValue || '',
    unit: initialGoal?.unit || '%',
    weight: initialGoal?.weight ?? 25,
    multiplier: initialGoal?.multiplier ?? 1.0,
    dueDate: initialGoal?.dueDate || '2026-11-30',
    actualValue: initialGoal?.actualValue || '',
    progressPct: initialGoal?.progressPct ?? 0,
  }));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetValue.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      titleTh: form.titleTh.trim() || form.title.trim(),
      targetValue: form.targetValue.trim(),
      unit: form.unit.trim() || '%',
      metric: `${form.targetValue.trim()} ${form.unit.trim() || '%'}`,
      weight: Number(form.weight),
      multiplier: Number(form.multiplier),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--backdrop-overlay)' }}
    >
      <div className="w-full max-w-xl rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card)] p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">
            {initialGoal ? t.goalModalEditTitle : t.goalModalAddTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.goalTitleLabel}
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, titleTh: e.target.value }))}
              placeholder="e.g. Ship WCAG AA Accessibility Audit across 5 core HR screens"
              className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalMetricTypeLabel}
              </label>
              <select
                value={form.metricType}
                onChange={(e) => setForm((p) => ({ ...p, metricType: e.target.value }))}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
              >
                <option value="QUANTITATIVE">{t.metricQuantitative}</option>
                <option value="QUALITATIVE">{t.metricQualitative}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalDueDateLabel}
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalTargetLabel}
              </label>
              <input
                type="text"
                required
                value={form.targetValue}
                onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                placeholder="e.g. 88 or 12M"
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalUnitLabel}
              </label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder="e.g. SUS Score, M THB, %"
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalWeightLabel}
              </label>
              <input
                type="number"
                min={5}
                max={100}
                step={5}
                required
                value={form.weight}
                onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalMultiplierLabel}
              </label>
              <select
                value={form.multiplier}
                onChange={(e) => setForm((p) => ({ ...p, multiplier: Number(e.target.value) }))}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] tabular-nums"
              >
                <option value={1.0}>{t.multStandard}</option>
                <option value={1.1}>{t.multStretch}</option>
                <option value={1.2}>{t.multBreakthrough}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
            >
              {t.confirmBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
