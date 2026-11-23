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
      reason: reason || (patch.isLocked ? 'HR locked the review cycle.' : 'HR reopened the review cycle.'),
      metadata: { isLocked: patch.isLocked },
    });
  } else if (patch.isGracePeriodActive !== undefined) {
    appendAuditLog({
      cycleId: updated.id,
      actor: req.user,
      action: patch.isGracePeriodActive ? 'ENABLE_GRACE_PERIOD' : 'DISABLE_GRACE_PERIOD',
      reason: reason || 'HR updated cycle grace period setting.',
      metadata: { isGracePeriodActive: patch.isGracePeriodActive },
    });
  }

  return res.json({
    ok: true,
    data: { cycle: updated },
    meta: { timestamp: new Date().toISOString() },
  });
}
