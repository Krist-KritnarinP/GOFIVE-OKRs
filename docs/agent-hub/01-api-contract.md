# 01 — API Contract & Data Model Specification

**Base URL (Local):** `http://localhost:5001/api/v1`  
**Format:** JSON (`Content-Type: application/json`), Pure JavaScript ESM (`backend/`)  
**Validation:** Zod schemas on all request bodies, params, and queries  

---

## 1. Standard Response & Error Envelope

### Success Response
```json
{
  "ok": true,
  "data": {},
  "meta": {
    "timestamp": "2026-11-23T09:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMITED | INTERNAL_ERROR",
    "message": "Human-readable error summary",
    "details": [
      { "field": "evidence", "message": "Evidence (min 20 chars) is required for ratings of 1, 2, or 5." }
    ]
  }
}
```

---

## 2. Authentication & RBAC Rules

| Role | Code | Access Scope |
| :--- | :--- | :--- |
| **HR Admin** | `HR_ADMIN` | Full cycle config, org analytics, bias alerts, exception actions, publish results, audit logs |
| **Manager** | `MANAGER` | Own direct reports only (`review.managerId === user.id`), plus own employee review if applicable |
| **Employee** | `EMPLOYEE` | Own review only (`review.employeeId === user.id`). **MUST NEVER receive `managerRatings`, `managerComment`, `overallScore`, or `quadrant` while `status !== 'PUBLISHED'`.** |

### Auth Endpoints
- `GET /health` *(Public)* — Returns server status, storage mode (`prisma` or `memory-fallback`), and timestamp.
- `GET /auth/demo-accounts` *(Public — Prototype Demo Mode)* — Returns list of selectable demo personas (HR Admin, 2 Managers including 1 lenient/1 overdue, 2 Employees) without password hashes.
- `POST /auth/login` *(Public, Rate-Limited)* — Body: `{ email, password }` → Returns `{ token, user }`.
- `POST /auth/demo-switch` *(Public — Prototype Demo Mode, Rate-Limited)* — Body: `{ userId }` → Issues a real signed JWT for the chosen demo persona so all downstream API calls still undergo full JWT + RBAC verification.
- `GET /auth/me` *(Authenticated)* — Returns current authenticated user profile.

---

## 3. Core Domain Endpoints

### Review Cycle & Rubric
- `GET /cycles/active` *(Authenticated)*
  - Returns active cycle metadata (`id`, `name`, `nameTh`, `period`, `whatWeight`, `howWeight`, `selfDeadline`, `managerDeadline`, `isGracePeriodActive`, `isLocked`, `rubricLevels[1..5]`, `competencies[]`).
- `PATCH /cycles/:cycleId` *(RBAC: `HR_ADMIN` only)*
  - Body (Zod): `{ whatWeight?, howWeight?, selfDeadline?, managerDeadline?, isGracePeriodActive?, isLocked? }` (`whatWeight + howWeight === 100` when provided). Writes `AuditLog` on lock/grace-period toggles.

### Reviews — Employee & Manager Flows
- `GET /reviews/me` *(RBAC: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`)*
  - Returns the authenticated user's own review record, goals, self-review inputs, lifecycle status, and deadline info.
  - **Security Filter:** Server strips `managerGoalRatings`, `managerCompetencyRatings`, `managerSummary`, `whatScore`, `howScore`, `overallScore`, `quadrant` whenever `status !== 'PUBLISHED'`.
- `PUT /reviews/:reviewId/self-review` *(RBAC: owner `review.employeeId === user.id`)*
  - Allowed only when `status === 'DRAFT'`.
  - Body (Zod): `{ goalAssessments: [{ goalId, selfScore (1..5), selfEvidence }], competencyAssessments: [{ competencyId, selfScore (1..5), selfNote }], reflection, submit: boolean }`.
  - If `submit: true`, transitions `DRAFT` → `SELF_REVIEW_SUBMITTED` and stamps `selfSubmittedAt`.
- `GET /reviews/team` *(RBAC: `MANAGER`, `HR_ADMIN`)*
  - For `MANAGER`, returns ONLY direct reports (`managerId === user.id`) plus team distribution summary vs. org guideline.
- `GET /reviews/:reviewId` *(RBAC: `HR_ADMIN`, assigned `MANAGER`, or owning `EMPLOYEE`)*
  - Enforces ownership and strips manager fields for `EMPLOYEE` if not `PUBLISHED`.
- `PUT /reviews/:reviewId/manager-review` *(RBAC: assigned `MANAGER` or `HR_ADMIN`)*
  - Allowed when `status` is `SELF_REVIEW_SUBMITTED` or `MANAGER_REVIEW_SUBMITTED` (before publish), or `DRAFT` if HR escalated/unlocked.
  - Body (Zod): `{ goalRatings: [{ goalId, score (1..5), evidence }], competencyRatings: [{ competencyId, score (1..5), evidence }], managerSummary, developmentFocus, submit: boolean }`.
  - **Fairness Business Rule (Server-Enforced):** If `submit: true`, any rating with `score === 1 || score === 2 || score === 5` MUST include `evidence.trim().length >= 20`. Otherwise return `400 VALIDATION_ERROR`.
  - Calculates `whatPct`, `whatScore`, `howScore`, `overallScore`, and `nineBoxCell` (3×3 Goal Achievement % × Competency 1–5) on the server.
  - If `submit: true`, transitions status to `READY_FOR_RELEASE`.

### HR Analytics, Bias Detection, Exceptions & Publish
- `GET /hr/overview` *(RBAC: `HR_ADMIN` only)*
  - Returns:
    - `summary`: `{ totalEmployees, selfCompletedCount, managerCompletedCount, publishedCount, overdueCount, orgAverageScore }`
    - `distribution`: histogram buckets `[1..5]`
    - `talentMatrix`: array of `{ reviewId, employeeName, department, managerName, whatScore, howScore, overallScore, quadrant, status }`
    - `biasAlerts`: array of `{ managerId, managerName, department, teamSize, teamAvg, orgAvg, delta, flagType: 'LENIENCY_BIAS' | 'SEVERITY_BIAS' | 'UNIFORM_RATING', explanation }`
    - `exceptions`: overdue reviews with `daysOverdue`, `missingActor`, `escalationStatus`, `extendedDeadline`
- `POST /hr/reviews/:reviewId/nudge` *(RBAC: `HR_ADMIN` only)*
  - Body (Zod): `{ message?: string }` → Logs a nudge reminder in `AuditLog` and updates `lastNudgedAt`.
- `POST /hr/reviews/:reviewId/extend-deadline` *(RBAC: `HR_ADMIN` only)*
  - Body (Zod): `{ extraDays: number (1..30), reason: string (min 5 chars) }` → Extends review deadline, clears overdue flag if new deadline is in the future, writes `AuditLog`.
- `POST /hr/reviews/:reviewId/escalate` *(RBAC: `HR_ADMIN` only)*
  - Body (Zod): `{ reason: string (min 5 chars) }` → Flags `escalatedToSkipLevel: true`, assigns skip-level reviewer note, writes `AuditLog`.
- `POST /hr/cycles/:cycleId/publish` *(RBAC: `HR_ADMIN` only)*
  - Body (Zod): `{ reviewIds?: string[] }` (if omitted, publishes all `READY_FOR_RELEASE` reviews) → Transitions matching reviews to `PUBLISHED`, stamps `publishedAt`, writes `AuditLog`.
- `GET /hr/audit-logs` *(RBAC: `HR_ADMIN` only)*
  - Returns chronological audit trail of exception actions, deadline changes, and publish events.

---

## 4. Review Lifecycle State Machine
```
DRAFT ──(Employee Submit)──▶ SELF_REVIEW_SUBMITTED ──(Manager Submit)──▶ READY_FOR_RELEASE ──(HR Publish)──▶ PUBLISHED
```
*Future Calibration Extension Point (Part 2 Q2):* Insert `CALIBRATION_PENDING` → `CALIBRATION_LOCKED` between `READY_FOR_RELEASE` and `PUBLISHED`, keeping the exact same server-side visibility filter (`status === 'PUBLISHED'`) intact.

---

## 5. Prisma Schema Plan (Supabase Dual-URL)
- `User` (`id`, `email`, `passwordHash`, `name`, `title`, `department`, `role`, `managerId`)
- `ReviewCycle` (`id`, `name`, `period`, `whatWeight`, `howWeight`, `selfDeadline`, `managerDeadline`, `isActive`)
- `Goal` (`id`, `cycleId`, `employeeId`, `title`, `titleTh`, `metric`, `weight`, `progressPct`)
- `Review` (`id`, `cycleId`, `employeeId`, `managerId`, `status`, `selfPayload`, `managerPayload`, `whatScore`, `howScore`, `overallScore`, `quadrant`, `extendedDeadline`, `escalatedToSkipLevel`, `lastNudgedAt`, `publishedAt`)
- `AuditLog` (`id`, `cycleId`, `reviewId`, `actorId`, `action`, `reason`, `metadata`, `createdAt`)
