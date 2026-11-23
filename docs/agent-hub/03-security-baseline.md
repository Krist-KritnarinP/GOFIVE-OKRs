# 03 — Security & Privacy Baseline (Release Gate)

**Target Level:** Standard Production Baseline (adapted for Prototype Demo with real server-side enforcement)

---

## 1. Threat Model & Controls

| Area | Requirement | Implementation Target (`backend/` & `frontend/`) |
| :--- | :--- | :--- |
| **HTTP Security Headers** | Mitigate clickjacking, MIME sniffing, XSS vectors | `helmet()` configured on Express with safe defaults + `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| **CORS Policy** | Prevent unauthorized cross-origin API access | `cors()` with explicit origin whitelist from `CORS_ORIGINS` env var (defaults to `http://localhost:5173` in local dev) |
| **Rate Limiting** | Prevent brute-force / endpoint abuse | `express-rate-limit` on `/api/v1/auth/*` (strict) and general `/api/v1/*` routes |
| **Authentication** | Stateless signed JWT, never trust client-supplied role headers | `jsonwebtoken` signed with `JWT_SECRET` from env; `bcryptjs` password hashing for standard login; demo-switch issues real signed JWT |
| **Authorization (RBAC)** | Enforce role & record ownership on every protected route | Dedicated `requireAuth` + `requireRole(...)` middleware + service-level ownership checks (`employeeId === user.id`, `managerId === user.id`) |
| **Data Leakage Prevention** | Employees MUST NOT see unpublished manager scores even by calling API directly | Dedicated serializer `sanitizeReviewForRole(review, user)` strips all manager ratings/comments/scores/quadrant when `user.role === 'EMPLOYEE' && review.status !== 'PUBLISHED'` |
| **Input Validation** | Treat all request payloads as untrusted | Strict **Zod** schemas on every POST/PUT/PATCH route; reject unknown/malformed payloads with `400 VALIDATION_ERROR` |
| **SQL Injection** | Parameterized queries only | Prisma ORM parameterized queries (zero raw string concatenation) |
| **Error Handling** | Never leak stack traces or internal DB details to clients | Centralized Express error handler returning sanitized error envelopes in production |
| **Secrets Hygiene** | Zero secrets in repo, logs, screenshots, or handover | `.gitignore` blocks `.env*` (except `.env.example`); startup env validator checks required keys |
| **Auditability & Privacy** | Track HR exception actions & respect PDPA minimization | `AuditLog` records actor, timestamp, action, and reason for Nudge/Extend/Escalate/Publish; no sensitive personal PII (ID numbers, salaries) stored in v1 |

---

## 2. Gate 3 Security Verification Checklist (For QA)
- [ ] Employee JWT calling `GET /api/v1/reviews/me` on an unpublished review receives `null`/omitted manager scores and comments.
- [ ] Employee JWT calling `GET /api/v1/hr/overview` or `POST /api/v1/hr/cycles/:id/publish` receives `403 FORBIDDEN`.
- [ ] Manager JWT calling `GET /api/v1/reviews/:otherTeamReviewId` receives `403 FORBIDDEN`.
- [ ] Submitting manager score `5` or `1` with empty/short evidence (`< 20 chars`) via direct API call receives `400 VALIDATION_ERROR`.
- [ ] Response headers include Helmet security headers (`x-content-type-options`, `x-frame-options`, etc.).
- [ ] Zero secrets present in `git diff` or committed files.
