import { useId, useRef, useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog.jsx';
import { TieredSelect } from '../common/TieredSelect.jsx';

const MODE_DEFAULTS = {
  QUANTITATIVE: { targetPlaceholder: 'e.g. 95 or 12M', unitPlaceholder: 'e.g. %, M THB, hours', defaultUnit: '%' },
  MILESTONE: { targetPlaceholder: 'e.g. 12 or 4', unitPlaceholder: 'e.g. monthly reports, handbook', defaultUnit: 'deliverables' },
  QUALITATIVE: { targetPlaceholder: 'e.g. 4.5 or 85', unitPlaceholder: 'e.g. / 5 CSAT, SUS Score', defaultUnit: '/ 5 score' },
};

export function GoalEditorModal({ isOpen, initialGoal, t, onClose, onSave }) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const titleRef = useRef(null);
  const targetRef = useRef(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => ({
    id: initialGoal?.id || `g-${Date.now()}`,
    title: initialGoal?.title || '',
    titleTh: initialGoal?.titleTh || '',
    metricType: initialGoal?.metricType || 'QUANTITATIVE',
    targetValue: initialGoal?.targetValue || '',
    unit: initialGoal?.unit || '%',
    weight: initialGoal?.weight ?? 30,
    multiplier: initialGoal?.multiplier ?? 1.0,
    dueDate: initialGoal?.dueDate || '2026-11-30',
    actualValue: initialGoal?.actualValue || '',
    progressPct: initialGoal?.progressPct ?? 0,
  }));

  if (!isOpen) return null;

  const modeMeta = MODE_DEFAULTS[form.metricType] || MODE_DEFAULTS.QUANTITATIVE;
  const modeTip =
    form.metricType === 'MILESTONE'
      ? t.metricTipMilestone
      : form.metricType === 'QUALITATIVE'
        ? t.metricTipQuality
        : t.metricTipNumeric;

  const handleModeChange = (nextMode) => {
    const nextMeta = MODE_DEFAULTS[nextMode] || MODE_DEFAULTS.QUANTITATIVE;
    setForm((p) => ({
      ...p,
      metricType: nextMode,
      unit: !p.unit || p.unit === '%' || p.unit === 'deliverables' || p.unit === '/ 5 score' ? nextMeta.defaultUnit : p.unit,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError(t.errGoalTitleRequired || 'Enter an OKR title before saving.');
      titleRef.current?.focus();
      return;
    }
    if (!form.targetValue.trim()) {
      setError(t.errGoalTargetRequired || 'Enter a target value before saving.');
      targetRef.current?.focus();
      return;
    }
    setError('');
    onSave({
      ...form,
      title: form.title.trim(),
      titleTh: form.titleTh.trim() || form.title.trim(),
      targetValue: form.targetValue.trim(),
      unit: form.unit.trim() || modeMeta.defaultUnit,
      metric: `${form.targetValue.trim()} ${form.unit.trim() || modeMeta.defaultUnit}`,
      weight: Number(form.weight),
      multiplier: Number(form.multiplier),
    });
    onClose();
  };

  const priorityChoices = [
    { value: 50, label: t.priorityMain || 'Main Focus (50%)' },
    { value: 30, label: t.priorityStandard || 'Core Work (30%)' },
    { value: 20, label: t.prioritySupport || 'Supporting (20%)' },
  ];

  return (
    <ModalDialog isOpen={isOpen} labelledBy={titleId} variant="center" maxWidthClass="max-w-xl" onClose={onClose}>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h1 id={titleId} className="text-lg font-bold text-(--ink-primary)">
            {initialGoal ? t.goalModalEditTitle : t.goalModalAddTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`${uid}-gtitle`} className="block text-sm font-semibold text-(--ink-primary)">
              {t.goalTitleLabel}
            </label>
            <input
              ref={titleRef}
              id={`${uid}-gtitle`}
              name="title"
              type="text"
              required
              autoFocus
              aria-invalid={error && !form.title.trim() ? 'true' : 'false'}
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value, titleTh: e.target.value }));
                if (error) setError('');
              }}
              placeholder={t.goalTitlePlaceholder || 'e.g. Ship WCAG AA Audit across 5 core HR screens'}
              className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-base text-(--ink-primary)"
            />
          </div>

          {/* 3 Natural Measurement Modes with 1-line Contextual Tip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-mtype`} className="block text-sm font-semibold text-(--ink-primary)">
                {t.goalMetricTypeLabel}
              </label>
              <TieredSelect
                id={`${uid}-mtype`}
                name="metricType"
                value={form.metricType}
                onChange={(e) => handleModeChange(e.target.value)}
                className="w-full min-h-11"
                options={[
                  { value: 'QUANTITATIVE', label: t.metricQuantitative, tone: 'track' },
                  { value: 'MILESTONE', label: t.metricMilestone, tone: 'high' },
                  { value: 'QUALITATIVE', label: t.metricQualitative, tone: 'indigo' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-due`} className="block text-sm font-semibold text-(--ink-primary)">
                {t.goalDueDateLabel}
              </label>
              <input
                id={`${uid}-due`}
                name="dueDate"
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary) tabular-nums"
              />
            </div>
          </div>

          {modeTip && (
            <p className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) px-3 py-2 flex items-start gap-2 text-xs text-(--ink-secondary)">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-(--brand-primary)" aria-hidden="true" />
              <span>{modeTip}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-target`} className="block text-sm font-semibold text-(--ink-primary)">
                {t.goalTargetLabel}
              </label>
              <input
                ref={targetRef}
                id={`${uid}-target`}
                name="targetValue"
                type="text"
                required
                aria-invalid={error && !form.targetValue.trim() ? 'true' : 'false'}
                value={form.targetValue}
                onChange={(e) => {
                  setForm((p) => ({ ...p, targetValue: e.target.value }));
                  if (error) setError('');
                }}
                placeholder={modeMeta.targetPlaceholder}
                className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary) tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-unit`} className="block text-sm font-semibold text-(--ink-primary)">
                {t.goalUnitLabel}
              </label>
              <input
                id={`${uid}-unit`}
                name="unit"
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder={modeMeta.unitPlaceholder}
                className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary)"
              />
            </div>
          </div>

          {/* Zero-Math Quick Importance Buttons */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-(--ink-muted)">
              {t.priorityQuickLabel}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {priorityChoices.map((choice) => {
                const active = Number(form.weight) === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, weight: choice.value }))}
                    className={`min-h-10 px-2.5 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                        : 'bg-(--surface-subtle) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-weight`} className="block text-sm font-semibold text-(--ink-primary)">
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
                className="w-full min-h-11 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary) tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-mult`} className="block text-sm font-semibold text-(--ink-primary)">
                {t.goalMultiplierLabel}
              </label>
              <TieredSelect
                id={`${uid}-mult`}
                name="multiplier"
                value={form.multiplier}
                onChange={(e) => setForm((p) => ({ ...p, multiplier: Number(e.target.value) }))}
                className="w-full min-h-11 tabular-nums"
                options={[
                  { value: 1.0, label: t.multStandard, tone: 'neutral' },
                  { value: 1.1, label: t.multStretch, tone: 'track' },
                  { value: 1.2, label: t.multBreakthrough, tone: 'indigo' },
                ]}
              />
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border-subtle)">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) active:scale-98 text-sm font-semibold text-(--ink-primary) transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) active:scale-98 text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
            >
              {t.saveOkrBtn || t.confirmBtn}
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
}
