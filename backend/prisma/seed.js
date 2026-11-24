import { PrismaClient } from '@prisma/client';
import { createInitialSeed } from '../src/data/seedData.js';

const prisma = new PrismaClient();

async function main() {
  const seed = createInitialSeed();

  console.log('[prisma:seed] Seeding 1-office-unit dataset (16 users, job levels, 3-stage cycle, OKRs, reviews, logs)...');

  await prisma.reviewCycle.upsert({
    where: { id: seed.cycle.id },
    update: {},
    create: {
      id: seed.cycle.id,
      name: seed.cycle.name,
      nameTh: seed.cycle.nameTh,
      period: seed.cycle.period,
      whatWeight: seed.cycle.whatWeight,
      howWeight: seed.cycle.howWeight,
      stage1DraftDeadline: new Date(seed.cycle.stage1DraftDeadline),
      stage2ApprovalDeadline: new Date(seed.cycle.stage2ApprovalDeadline),
      stage3HrAuditDeadline: new Date(seed.cycle.stage3HrAuditDeadline),
      selfDeadline: new Date(seed.cycle.selfDeadline),
      managerDeadline: new Date(seed.cycle.managerDeadline),
      isGracePeriodActive: seed.cycle.isGracePeriodActive,
      isLocked: seed.cycle.isLocked,
      isActive: seed.cycle.isActive,
      rubricConfig: {
        rubricLevels: seed.cycle.rubricLevels,
        competencies: seed.cycle.competencies,
      },
    },
  });

  for (const user of seed.users) {
    await prisma.user.upsert({
      where: { employeeCode: user.employeeCode },
      update: {},
      create: {
        id: user.id,
        employeeCode: user.employeeCode,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        nameTh: user.nameTh,
        title: user.title,
        department: user.department,
        jobLevel: user.jobLevel || 'L2_MID',
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  }

  for (const user of seed.users) {
    if (user.managerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { managerId: user.managerId },
      });
    }
  }

  for (const [role, perms] of Object.entries(seed.rolePermissions)) {
    for (const [permissionKey, allowed] of Object.entries(perms)) {
      await prisma.rolePermission.upsert({
        where: { role_permissionKey: { role, permissionKey } },
        update: { allowed },
        create: { role, permissionKey, allowed },
      });
    }
  }

  for (const goal of seed.goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: {
        ...goal,
        dueDate: goal.dueDate ? new Date(goal.dueDate) : null,
      },
    });
  }

  for (const rev of seed.reviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {},
      create: {
        id: rev.id,
        cycleId: rev.cycleId,
        employeeId: rev.employeeId,
        managerId: rev.managerId,
        status: rev.status,
        revisionRound: rev.revisionRound ?? 1,
        selfPayload: rev.selfPayload,
        managerPayload: rev.managerPayload,
        commentHistory: rev.commentHistory ?? [],
        whatPct: rev.whatPct,
        whatScore: rev.whatScore,
        howScore: rev.howScore,
        overallScore: rev.overallScore,
        nineBoxCell: rev.nineBoxCell,
        goalsSubmittedAt: rev.goalsSubmittedAt ? new Date(rev.goalsSubmittedAt) : null,
        goalsApprovedAt: rev.goalsApprovedAt ? new Date(rev.goalsApprovedAt) : null,
        selfSubmittedAt: rev.selfSubmittedAt ? new Date(rev.selfSubmittedAt) : null,
        managerSubmittedAt: rev.managerSubmittedAt ? new Date(rev.managerSubmittedAt) : null,
        publishedAt: rev.publishedAt ? new Date(rev.publishedAt) : null,
      },
    });
  }

  for (const log of seed.auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        cycleId: log.cycleId,
        reviewId: log.reviewId,
        actorId: log.actorId,
        action: log.action,
        visibilityScope: log.visibilityScope,
        targetEmployeeId: log.targetEmployeeId,
        targetManagerId: log.targetManagerId,
        reason: log.reason,
        metadata: log.metadata ?? {},
        createdAt: new Date(log.createdAt),
      },
    });
  }

  console.log('[prisma:seed] Done! Seeded 16 users with Job Levels, 3-stage deadlines, OKRs, reviews, and role-scoped activity logs.');
}

main()
  .catch((err) => {
    console.error('[prisma:seed] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
