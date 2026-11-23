import { PrismaClient } from '@prisma/client';
import { createInitialSeed } from '../src/data/seedData.js';

const prisma = new PrismaClient();

async function main() {
  const seed = createInitialSeed();

  console.log('[prisma:seed] Seeding 1-office-unit dataset (16 users, 1 cycle, goals, reviews, permissions)...');

  // 1. Upsert Active Cycle
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

  // 2. Upsert 16 Users (first pass without managerId, second pass links managerId cleanly)
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

  // 3. Upsert Role Permission Matrix
  for (const [role, perms] of Object.entries(seed.rolePermissions)) {
    for (const [permissionKey, allowed] of Object.entries(perms)) {
      await prisma.rolePermission.upsert({
        where: { role_permissionKey: { role, permissionKey } },
        update: { allowed },
        create: { role, permissionKey, allowed },
      });
    }
  }

  // 4. Upsert Goals & Reviews
  for (const goal of seed.goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
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
        selfPayload: rev.selfPayload,
        managerPayload: rev.managerPayload,
        whatPct: rev.whatPct,
        whatScore: rev.whatScore,
        howScore: rev.howScore,
        overallScore: rev.overallScore,
        nineBoxCell: rev.nineBoxCell,
        selfSubmittedAt: rev.selfSubmittedAt ? new Date(rev.selfSubmittedAt) : null,
        managerSubmittedAt: rev.managerSubmittedAt ? new Date(rev.managerSubmittedAt) : null,
        publishedAt: rev.publishedAt ? new Date(rev.publishedAt) : null,
      },
    });
  }

  console.log('[prisma:seed] Done! Seeded 1 Super Admin, 2 HR Admins, 3 Managers, 6 Employees, 4 Pending New Employees.');
}

main()
  .catch((err) => {
    console.error('[prisma:seed] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
