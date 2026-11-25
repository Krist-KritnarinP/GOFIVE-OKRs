# 04 — Full-System Security & QA/QC Report (Rev 4)

**Project:** empeo — Performance Management Prototype (`GOFIVE TEST`)  
**Audit Date:** 2026-11-25  
**Target Commit Audited:** `4d2028d` (`main`)  
**Overall Verdict:** **PASS FOR PROTOTYPE / DEMO** · **CONDITIONAL PASS FOR PRODUCTION** (2 Backend Security Hardening items required before live production deployment)

---

## 1. Executive Scorecard

| Audit Domain | Scope | Result | Summary |
| :--- | :--- | :---: | :--- |
| **Backend Automated Security & RBAC Tests** | `npm --prefix backend test` (`NODE_ENV=test`) | **PASS** | **9/9 tests passed** (`1.24s`) — RBAC, IDOR, 4-Role Activity Log privacy, Approach A publish gate, `409` published state guards, evidence guardrail |
| **Frontend Static Lint & Production Build** | `oxlint` + `vite build` | **PASS** | **0 warnings, 0 errors** across 36 files (`11ms`); production build `294ms` (`139.46 kB` gzip) |
| **Static Security Code Scan** | `backend/src` + `frontend/src` | **PASS** | **0** XSS sinks (`dangerouslySetInnerHTML`/`innerHTML`), **0** `eval`/`new Function`, **0** unsafe raw SQL, **0** hardcoded secrets, **0** `.env` tracked in git, **0** `localStorage` token storage |
| **Dependency Vulnerability Audit** | `npm audit --omit=dev` | **PASS (FE) / WARN (BE)** | Frontend: **0 vulnerabilities**. Backend: **4 transitive high** inside `prisma` CLI (`@prisma/config` → `deepmerge-ts`, `effect`) — CLI-only, not Express runtime; move `prisma` to `devDependencies` |
| **Backend Auth & Governance Code Review** | `app.js`, `routes/*.js`, `authController.js`, `authMiddleware.js`, `env.js` | **2 FINDINGS** | **[S1 Critical-Prod]** `POST /auth/demo-switch` lacks `NODE_ENV=production` block; **[S2 High-Gov]** `PUT /reviews/:id/manager-review` still permits `HR_ADMIN` on API |
| **Live Browser E2E QA/QC** | `http://localhost:5173` (Desktop `1440x900` + Mobile `375x812`) | **PASS (2 Minor UI)** | All 4 roles + Invite/Activate + Inspect-Only 9-Box + Publish Confirm + HRBP Scope + HR Reminder + Manager Filters + Mobile `375px` 0-overflow verified; 1 React `borderColor`/`borderTopColor` warning & 1 double clear `×` icon caught |

---

## 2. Security Audit Findings & Remediation Plan

### Verified Security Controls (PASS)
- **HTTP Hardening (`backend/src/app.js`):** `app.disable('x-powered-by')`, `helmet()`, explicit `CORS_ORIGINS` allowlist (`credentials: true`), global rate limiter (`500 req / 15 min`), strict `authLimiter` on `/login`, `/register`, `/demo-switch`, and `express.json({ limit: '1mb' })`.
- **Production Secret Guard (`backend/src/config/env.js`):** Refuses startup if `NODE_ENV === 'production'` and `JWT_SECRET` uses the `dev-only-` default.
- **Auth & Live Account Enforcement (`backend/src/middleware/authMiddleware.js`):** Verifies JWT signature, re-checks live user `accountStatus === 'ACTIVE'` on every request, hashes passwords with `bcryptjs` (cost 10), and enforces `403` for `PENDING_APPROVAL` and `SUSPENDED`.
- **Role-Scoped Privacy & State Guards:** Verified via automated tests (`9/9 PASS`): Employees cannot read unpublished manager scores (`MANAGER_APPROVED`) or internal HR bias alerts; Managers cannot read other teams; Published reviews reject mutations with `409 CONFLICT`.

### Actionable Security Findings

| ID | Severity | Location | Finding | Recommended Remediation |
| :--- | :---: | :--- | :--- | :--- |
| **S1** | **CRITICAL (Prod)** | [authController.js](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/backend/src/controllers/authController.js#L157-L180) | `POST /api/v1/auth/demo-switch` issues a signed JWT for any active `userId` (including `SUPER_ADMIN`) without authentication or a `NODE_ENV` guard. | Block when `env.NODE_ENV === 'production'` unless an explicit `ENABLE_DEMO_MODE=true` env flag is set. |
| **S2** | **HIGH (Governance)** | [reviewRoutes.js](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/backend/src/routes/reviewRoutes.js#L43-L49) | Frontend HR `EvaluationDrawer` is locked to `readOnly` (Inspect Only), but backend `PUT /api/v1/reviews/:reviewId/manager-review` still allows `HR_ADMIN` in `requireRole(...)`. | Remove `HR_ADMIN` from `PUT /:reviewId/manager-review` (allow `MANAGER` for their own direct reports only). HR uses `POST /hr/reviews/:id/return-to-manager`. |
| **S3** | **MEDIUM (Supply Chain)** | `backend/package.json` | `prisma` CLI is in `dependencies`, pulling 4 transitive high advisories (`deepmerge-ts`, `effect` via `@prisma/config`) into `npm audit --omit=dev`. Runtime `@prisma/client` is unaffected. | Move `prisma` from `dependencies` to `devDependencies` (keep `@prisma/client` in `dependencies`). |
| **S4** | **MEDIUM (Prod Architecture)** | [usePerformanceStore.js](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/frontend/src/hooks/usePerformanceStore.js) | Local Demo Mode stores simulated passwords in client memory and generates 6-digit invite codes via `Math.random()`. | For production, move Invite/Activate to backend endpoints using `crypto.randomInt(100000, 999999)`, 72h expiry, single-use invalidation, and rate limiting. |

---

## 3. Full-System Live Browser QA/QC Results (`http://localhost:5173`)

Host-verified origin: `http://localhost:5173` (no blocked origins, 0 network errors).

| # | Flow / Module Tested | Result | Evidence |
|---:|---|:---:|---|
| 1 | **Login & 2-Tab Onboarding** (`Activate Account` + `Request Access`) | **PASS** | Clean load, 0 console errors, both tabs & `Back to Sign In` verified |
| 2 | **Super Admin `+ Invite Employee` → 6-Digit Code → Activate** | **PASS** | Invited `EMP-3099` (`QA Test User`), generated code `660251`, verified `Invited` badge & code chip in directory, signed out, activated `EMP-3099` with `660251` + `TestPass123!` → `"Account Activated"` |
| 3 | **HR Admin — 9-Box Heat-Map & Color Rails** | **PASS** | Spacious 3×3 diagonal heat-map cells + borderless color rails verified |
| 4 | **HR Admin — HRBP Scope Toggle** (`All Org` ↔ `My Assigned Teams`) | **PASS** | Counts & KPIs updated dynamically (`7` → `5` reviews, `57%` → `40%`, `4.22` → `3.44`, Bias Alerts `1` → `0`) |
| 5 | **HR Admin — 9-Box Inspect-Only Drawer** | **PASS** | Clicked `L2 Arthit Kongkiat (5.0)`; `"Inspect-Only Mode"` notice shown, `0` enabled inputs, only `Close` & `Return to Manager` actions rendered |
| 6 | **HR Admin — Publish Confirm Modal** | **PASS** | Showed `Ready to Publish & Lock: 3` vs `Still In Progress: 3`; cancel preserved state cleanly |
| 7 | **HR Admin — `Send Reminder` → Manager HR Reminder Banner** | **PASS** | Toast `"SLA reminder sent and logged."` + Activity Log incremented (`6` → `7`) + Manager Workspace displayed `"HR REMINDER Pluem Srisuk sent a reminder on Nov 25, 05:49 PM for: Tonrak Chaiyawat."` with `Open Review` CTA |
| 8 | **Manager Workspace — Clean Header + Search & 5 Filter Chips** | **PASS** | Header showed `Engineering` + `Direct Reports: 3 people` (no long name wall); search & `Reset filter` verified |
| 9 | **Employee Workspace — Reporting Manager + `StageStatusBar`** | **PASS** | `Product` + `Reporting Manager: Kanya Rattanapong` shown; unreached Stages 2 & 3 showed `Pending prior stage` (no false `Overdue`) |
| 10 | **Mobile `375x812` Responsiveness** | **PASS** | `body`, `main`, `banner` all measured exact `375px` width (`0` horizontal overflow) |

### Minor UI/QC Bugs Caught During Live Browser Testing

| ID | Severity | Location | Issue | Fix |
| :--- | :---: | :--- | :--- | :--- |
| **Q1** | **LOW** | [NineBoxGrid.jsx](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/frontend/src/components/hr/NineBoxGrid.jsx) | React console warning on HRBP Scope rerender: mixing shorthand `borderColor` and `borderTopColor` in inline `style`. | Replace `borderColor` with explicit `borderLeftColor`, `borderRightColor`, `borderBottomColor` alongside `borderTopColor`. |
| **Q2** | **LOW** | [ManagerWorkspacePage.jsx](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/frontend/src/pages/ManagerWorkspacePage.jsx) | `<input type="search">` shows both custom `×` clear button and browser's native search cancel `×` icon side-by-side. | Change input to `type="text" role="searchbox"` so only the custom accessible clear button renders. |
| **Q3** | **INFO** | [DemoRolePickerPage.jsx](file:///Users/kritnarinp/Desktop/GOFIVE%20TEST/frontend/src/pages/DemoRolePickerPage.jsx) / Vite Build | Static `"16 Users"` badge doesn't increment when a 17th user is invited; JS bundle is `541 kB` (`139 kB` gzip). | Compute user count dynamically from `users.length`; optionally add `React.lazy()` route splitting. |

---

## 4. Verification Evidence
- **Latest Mobile QA Screenshot:** `/Users/kritnarinp/.gemini/antigravity/brain/d0877c50-acdc-4a27-98ef-ed06446aad12/browser_evidence/3730a42a-0352-4c51-b6c6-f1480b02ce95/final_step_57.png`
- **Backend Test Suite:** `9/9 PASS` (`NODE_ENV=test`)
- **Frontend Build & Lint:** `oxlint` `0 warnings, 0 errors` (36 files) · `vite build` `PASS` (`294ms`)
