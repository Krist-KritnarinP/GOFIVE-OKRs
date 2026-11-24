import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog.jsx';

export function GoalEditorModal({ isOpen, initialGoal, t, onClose, onSave }) {
  const uid = useId();
  const titleId = `${uid}-title`;
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
    <ModalDialog isOpen={isOpen} labelledBy={titleId} variant="center" maxWidthClass="max-w-xl" onClose={onClose}>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h1 id={titleId} className="text-lg font-bold text-[var(--ink-primary)]">
            {initialGoal ? t.goalModalEditTitle : t.goalModalAddTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-gtitle`} className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.goalTitleLabel}
            </label>
            <input
              id={`${uid}-gtitle`}
              name="title"
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, titleTh: e.target.value }))}
              placeholder={t.goalTitlePlaceholder || 'e.g. Ship WCAG AA Audit across 5 core HR screens'}
              className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-base text-[var(--ink-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-mtype`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalMetricTypeLabel}
              </label>
              <select
                id={`${uid}-mtype`}
                name="metricType"
                value={form.metricType}
                onChange={(e) => setForm((p) => ({ ...p, metricType: e.target.value }))}
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)]"
              >
                <option value="QUANTITATIVE">{t.metricQuantitative}</option>
                <option value="QUALITATIVE">{t.metricQualitative}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-due`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalDueDateLabel}
              </label>
              <input
                id={`${uid}-due`}
                name="dueDate"
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
              <label htmlFor={`${uid}-target`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalTargetLabel}
              </label>
              <input
                id={`${uid}-target`}
                name="targetValue"
                type="text"
                required
                value={form.targetValue}
                onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                placeholder="e.g. 88 or 12M"
                className="w-full min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 text-sm text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-unit`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalUnitLabel}
              </label>
              <input
                id={`${uid}-unit`}
                name="unit"
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
              <label htmlFor={`${uid}-weight`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalWeightLabel}
              </label>
              <input
                id={`${uid}-weight`}
                name="weight"
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
              <label htmlFor={`${uid}-mult`} className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.goalMultiplierLabel}
              </label>
              <select
                id={`${uid}-mult`}
                name="multiplier"
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
              className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] active:scale-[0.98] text-sm font-semibold text-[var(--ink-primary)] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {t.saveOkrBtn || t.confirmBtn}
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
}
