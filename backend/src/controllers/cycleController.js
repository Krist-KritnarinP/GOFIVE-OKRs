import { appendAuditLog, getCycle, updateCycle } from '../services/storeService.js';

export function getActiveCycle(_req, res) {
  res.json({
    ok: true,
    data: { cycle: getCycle() },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function patchCycle(req, res) {
  const { cycleId } = req.params;
  const current = getCycle();

  if (current.id !== cycleId) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review cycle not found.' },
    });
  }

  const { reason, ...patch } = req.validatedBody;
  const updated = updateCycle(patch);

  if (patch.isLocked !== undefined) {
    appendAuditLog({
      cycleId: updated.id,
      actor: req.user,
      action: patch.isLocked ? 'LOCK_CYCLE' : 'UNLOCK_CYCLE',
      visibilityScope: 'CYCLE_GOVERNANCE',
      reason: reason || (patch.isLocked ? 'HR locked the review cycle.' : 'HR reopened the review cycle.'),
      metadata: { isLocked: patch.isLocked },
    });
  } else if (patch.isGracePeriodActive !== undefined) {
    appendAuditLog({
      cycleId: updated.id,
      actor: req.user,
      action: patch.isGracePeriodActive ? 'ENABLE_GRACE_PERIOD' : 'DISABLE_GRACE_PERIOD',
      visibilityScope: 'CYCLE_GOVERNANCE',
      reason: reason || 'HR updated cycle grace period setting.',
      metadata: { isGracePeriodActive: patch.isGracePeriodActive },
    });
  } else if (
    patch.stage1DraftDeadline ||
    patch.stage2ApprovalDeadline ||
    patch.stage3HrAuditDeadline
  ) {
    appendAuditLog({
      cycleId: updated.id,
      actor: req.user,
      action: 'UPDATE_STAGE_DEADLINES',
      visibilityScope: 'CYCLE_GOVERNANCE',
      reason: reason || 'HR updated stage-based cycle deadlines.',
      metadata: {
        stage1DraftDeadline: updated.stage1DraftDeadline,
        stage2ApprovalDeadline: updated.stage2ApprovalDeadline,
        stage3HrAuditDeadline: updated.stage3HrAuditDeadline,
      },
    });
  }

  return res.json({
    ok: true,
    data: { cycle: updated },
    meta: { timestamp: new Date().toISOString() },
  });
}
