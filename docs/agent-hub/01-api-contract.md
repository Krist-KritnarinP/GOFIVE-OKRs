# 01 — API Contract & Data Model Specification (Synced to v1.5)

**Base URL (Local):** `http://localhost:5001/api/v1`  
**Format:** JSON (`Content-Type: application/json`), Pure JavaScript ESM (`backend/`)  
**Validation:** Zod schemas on all request bodies, params, and queries  

---

## 1. Standard Response & Error Envelope
- **Success:** `{ ok: true, data: { ... }, meta: { timestamp } }`
- **Error:** `{ ok: false, error: { code, message, details? } }` (`VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMITED | INTERNAL_ERROR`)

---

## 2. Authentication, Dynamic RBAC & Privacy Scopes

| Role | Code | Access Scope | Activity Log Scope (`GET /api/v1/activity-logs`) |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | User approvals, Role & Job Level assignment, Dynamic Role Permission Matrix (`rbac:manage`) | `ADMIN_SECURITY`, `CYCLE_GOVERNANCE` |
| **HR Admin** | `HR_ADMIN` | 3-Stage Deadlines, Org 9-Box, Bias Alerts, SLA & HRBP Advisor Notes, `HR Approve & Publish` | `CYCLE_GOVERNANCE`, `HR_INTERNAL`, `TEAM_MANAGER`, `PUBLIC_SELF` |
| **Manager** | `MANAGER` | Own direct reports only (`review.managerId === user.id`): OKR Co-Edit/Approve, Evidence-enforced Evaluation | Own team `TEAM_MANAGER`, `PUBLIC_SELF` (zero cross-team / HR internal leaks) |
| **Employee** | `EMPLOYEE` | Own OKRs & Self-Review only (`review.employeeId === user.id`). **Server strips all manager scores, internal comments & 9-Box until `status === 'PUBLISHED'`.** | Own `PUBLIC_SELF` only (zero unpublished scores / bias alerts) |

### Auth & Admin Endpoints
- `GET /health` *(Public)* — Server health, storage mode (`prisma | memory-fallback`), timestamp.
- `GET /auth/demo-accounts` *(Public)* — 4 default persona profiles (no password hashes).
- `POST /auth/register` *(Public, Rate-Limited)* — `{ employeeCode, name, department, title, jobLevel?, password }` → Creates `PENDING_APPROVAL` user (maps `managerId` by department).
- `POST /auth/login` *(Public, Rate-Limited)* — `{ employeeCode, password }` → Returns `{ token, user, permissions }`; blocks `PENDING_APPROVAL`/`SUSPENDED` with `403`.
- `POST /auth/demo-switch` *(Public, Rate-Limited)* — `{ userId }` → Issues real signed JWT for active demo user.
- `GET /auth/me` *(Authenticated)* — Current user + live permissions.
- `GET /admin/users` *(Permission: `rbac:manage`)* — Directory, permissions matrix, admin activity logs.
- `PATCH /admin/users/:userId` *(Permission: `rbac:manage`)* — Update `{ role?, jobLevel?, accountStatus? }`.
- `PUT /admin/permissions` *(Permission: `rbac:manage`)* — Toggle `{ role, permissionKey, allowed }`.

---

## 3. Core Performance & Activity Endpoints

### Cycle & Stage Deadlines
- `GET /cycles/active` *(Authenticated)* — Active cycle with `stage1DraftDeadline`, `stage2ApprovalDeadline`, `stage3HrAuditDeadline`, weights (`60/40`), rubric levels, competencies.
- `PATCH /cycles/:cycleId` *(Permission: `cycle:configure`)* — Update weights (`sum=100`), 3-Stage Due Dates, `isGracePeriodActive`, `isLocked`.

### OKRs, Ping-Pong & Reviews
- `GET /reviews/me` *(Authenticated)* — Own review sanitized by `sanitizeReviewForRole`.
- `GET /reviews/team` *(Roles: `MANAGER`, `HR_ADMIN`, `SUPER_ADMIN`)* — Direct reports + team vs. org benchmark.
- `GET /reviews/:reviewId` *(Owner, Assigned Manager, or Admin)* — Single review with RBAC enforcement.
- `PUT /reviews/:reviewId/goals` *(Owner only; status `GOAL_DRAFT | GOAL_REVISION_REQUIRED`)* — Enforces `sum(weight) === 100` on `submit: true`; transitions to `GOAL_PENDING_APPROVAL`.
- `POST /reviews/:reviewId/goals/decision` *(Assigned Manager / Admin; status `GOAL_PENDING_APPROVAL`)* — `APPROVE` (supports optional `adjustedGoals: [{ id, weight, multiplier }]` with `sum=100` + transparent before→after diff) or `REQUEST_REVISION` (requires comment `>= 5` chars).
- `PUT /reviews/:reviewId/self-review` *(Owner only; status `GOAL_APPROVED | REVIEW_REVISION_REQUIRED`)* — Records actuals, progress %, self scores, reflection; transitions to `SELF_REVIEW_SUBMITTED`.
- `POST /reviews/:reviewId/return-to-employee` *(Assigned Manager / Admin; status `SELF_REVIEW_SUBMITTED`)* — Returns self-review for stronger evidence (`REVIEW_REVISION_REQUIRED`).
- `PUT /reviews/:reviewId/manager-review` *(Assigned Manager / Admin; blocked if `PUBLISHED`)* — Enforces `evidence.length >= 20` on scores `1`, `2`, `5`; computes weighted What/How/Overall/9-Box; transitions to `MANAGER_APPROVED`.

### HR Oversight, HRBP Advisor, Publish & Activity Logs
- `GET /hr/overview` *(Permission: `analytics:view_org`)* — Summary KPIs, distribution buckets, `biasAlerts`, `exceptions` (SLA breach + Ping-Pong ≥ 2), enriched reviews, HR-scoped logs.
- `POST /hr/reviews/:reviewId/advisor-comment` *(Permission: `exception:manage`)* — Posts `HRBP_ADVISOR_COMMENT` facilitator note to thread + `PUBLIC_SELF` Activity Log.
- `POST /hr/reviews/:reviewId/nudge` *(Permission: `exception:manage`)* — Logs SLA reminder (`TEAM_MANAGER`).
- `POST /hr/reviews/:reviewId/extend-deadline` *(Permission: `exception:manage`)* — Extends deadline (`+1..30` days, `PUBLIC_SELF`).
- `POST /hr/reviews/:reviewId/escalate` *(Permission: `exception:manage`)* — Flags `escalatedToSkipLevel` (`HR_INTERNAL` — hidden from Employee & Manager).
- `POST /hr/reviews/:reviewId/return-to-manager` *(Permission: `review:publish`; status `MANAGER_APPROVED`)* — Returns evaluation to manager for review (`SELF_REVIEW_SUBMITTED`).
- `POST /hr/cycles/:cycleId/publish` *(Permission: `review:publish`)* — **Approach A (`HR Approve & Publish`)**: releases `MANAGER_APPROVED` → `PUBLISHED`.
- `GET /activity-logs` *(Authenticated — ALL 4 Roles)* — Returns strictly role-scoped activity logs via `filterActivityLogsForUser`.

---

## 4. Review Lifecycle State Machine (v1 Lean — Approach A)
```text
GOAL_DRAFT ⇄ GOAL_PENDING_APPROVAL ⇄ GOAL_REVISION_REQUIRED
    │ (Manager Co-Edit & Approve)
    ▼
GOAL_APPROVED ──▶ SELF_REVIEW_SUBMITTED ⇄ REVIEW_REVISION_REQUIRED
    │ (Manager Evaluate + Evidence Guardrail)
    ▼
MANAGER_APPROVED ──(HR Approve & Publish)──▶ PUBLISHED
```
*Future v2 Calibration Extension Point (Part 2 Q2):* Insert `CALIBRATION_PENDING` → `CALIBRATION_LOCKED` between `MANAGER_APPROVED` and `PUBLISHED`, preserving the exact same `status === 'PUBLISHED'` employee lock.
