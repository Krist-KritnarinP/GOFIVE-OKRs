import { z } from 'zod';

const scoreField = z.coerce.number().int().min(1).max(5);
const employeeCodeField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}-\d{3,6}$/, 'Employee code must follow format e.g. EMP-1001.');

export const demoSwitchSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export const loginSchema = z.object({
  employeeCode: employeeCodeField,
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z.object({
  employeeCode: employeeCodeField,
  name: z.string().trim().min(2, 'Full name is required.').max(100),
  department: z.string().trim().min(2, 'Department is required.').max(80),
  title: z.string().trim().min(2, 'Job title is required.').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(100),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  accountStatus: z.enum(['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED']).optional(),
});

export const adminUpdatePermissionSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']),
  permissionKey: z.enum([
    'rbac:manage',
    'cycle:configure',
    'analytics:view_org',
    'exception:manage',
    'review:publish',
    'team:evaluate',
    'self:submit',
    'audit:view',
  ]),
  allowed: z.boolean(),
});

export const updateCycleSchema = z
  .object({
    whatWeight: z.coerce.number().int().min(10).max(90).optional(),
    howWeight: z.coerce.number().int().min(10).max(90).optional(),
    selfDeadline: z.string().datetime().optional(),
    managerDeadline: z.string().datetime().optional(),
    isGracePeriodActive: z.boolean().optional(),
    isLocked: z.boolean().optional(),
    reason: z.string().trim().max(300).optional(),
  })
  .refine(
    (data) => {
      if (data.whatWeight !== undefined || data.howWeight !== undefined) {
        return (data.whatWeight ?? 0) + (data.howWeight ?? 0) === 100;
      }
      return true;
    },
    { message: 'whatWeight and howWeight must sum to 100.', path: ['whatWeight'] }
  );

export const goalItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, 'Goal title is required.').max(200),
  titleTh: z.string().trim().max(200).optional(),
  metricType: z.enum(['QUANTITATIVE', 'QUALITATIVE']).default('QUANTITATIVE'),
  targetValue: z.string().trim().min(1, 'Target value is required.').max(80),
  unit: z.string().trim().min(1, 'Unit is required.').max(40),
  weight: z.coerce.number().int().min(5).max(100),
  multiplier: z.coerce.number().refine((v) => [1, 1.1, 1.2].includes(v), {
    message: 'Multiplier must be 1.0, 1.1, or 1.2.',
  }).default(1.0),
  dueDate: z.string().min(4, 'Target hit date is required.'),
  progressPct: z.coerce.number().int().min(0).max(100).default(0),
});

export const submitGoalsSchema = z
  .object({
    goals: z.array(goalItemSchema).min(1, 'At least one goal is required.').max(10),
    comment: z.string().trim().max(1000).default(''),
    submit: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.submit) return true;
      const sum = data.goals.reduce((acc, g) => acc + g.weight, 0);
      return sum === 100;
    },
    { message: 'Total goal weight must equal exactly 100% before submission.', path: ['goals'] }
  );

export const goalDecisionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REQUEST_REVISION']),
    comment: z.string().trim().max(1000).default(''),
  })
  .refine(
    (data) => data.decision === 'APPROVE' || data.comment.trim().length >= 5,
    { message: 'Please provide a revision comment (min 5 characters) when returning goals.', path: ['comment'] }
  );

export const reviewReturnSchema = z.object({
  comment: z.string().trim().min(5, 'Revision comment must be at least 5 characters.').max(1000),
});

export const calibrateSchema = z.object({
  reviewIds: z.array(z.string().min(1)).optional(),
  note: z.string().trim().max(500).optional(),
});

export const selfReviewSchema = z.object({
  goalAssessments: z
    .array(
      z.object({
        goalId: z.string().min(1),
        actualValue: z.string().trim().max(120).optional(),
        progressPct: z.coerce.number().int().min(0).max(100).optional(),
        selfScore: scoreField,
        selfEvidence: z.string().trim().max(1000).default(''),
      })
    )
    .min(1),
  competencyAssessments: z
    .array(
      z.object({
        competencyId: z.string().min(1),
        selfScore: scoreField,
        selfNote: z.string().trim().max(1000).default(''),
      })
    )
    .min(1),
  reflection: z.string().trim().max(2000).default(''),
  submit: z.boolean().default(false),
});

export const managerReviewSchema = z
  .object({
    goalRatings: z
      .array(
        z.object({
          goalId: z.string().min(1),
          score: scoreField,
          evidence: z.string().trim().max(1000).default(''),
        })
      )
      .min(1),
    competencyRatings: z
      .array(
        z.object({
          competencyId: z.string().min(1),
          score: scoreField,
          evidence: z.string().trim().max(1000).default(''),
        })
      )
      .min(1),
    managerSummary: z.string().trim().max(2000).default(''),
    developmentFocus: z.string().trim().max(1000).default(''),
    submit: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.submit) return;

    data.goalRatings.forEach((item, idx) => {
      if ((item.score <= 2 || item.score === 5) && item.evidence.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['goalRatings', idx, 'evidence'],
          message: 'Evidence (minimum 20 characters) is required for ratings of 1, 2, or 5.',
        });
      }
    });

    data.competencyRatings.forEach((item, idx) => {
      if ((item.score <= 2 || item.score === 5) && item.evidence.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['competencyRatings', idx, 'evidence'],
          message: 'Evidence (minimum 20 characters) is required for ratings of 1, 2, or 5.',
        });
      }
    });
  });

export const nudgeSchema = z.object({
  message: z.string().trim().max(500).optional(),
});

export const extendDeadlineSchema = z.object({
  extraDays: z.coerce.number().int().min(1).max(30),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters.').max(300),
});

export const escalateSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters.').max(300),
});

export const publishSchema = z.object({
  reviewIds: z.array(z.string().min(1)).optional(),
});
