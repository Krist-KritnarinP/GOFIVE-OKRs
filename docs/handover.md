# Project Handover — empeo Performance Management Prototype (`GOFIVE TEST`)

**Last Updated:** 2026-11-26  
**Current Milestone:** Phase 5.0 Complete — **Full Pre-Vercel Security Hardening, Code-Splitting, Security Headers (`vercel.json`) & Production-Build Browser QA/QC Verified**  
**Next Action:** Import `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git` into Vercel (1-click zero-config via root `vercel.json`) and submit live Demo URL + Part 2 written answers.

---

## 1. Objective & Scope
Build a working, clickable multi-role prototype for **empeo Performance Management** (HRM + HRD) solving:
> *How do we make annual performance reviews fair across an entire organization, and genuinely surface who the high performers and low performers are?*

- **Core Product Concept:** *Evidence-First, Level-Anchored OKR & Dual-Axis Performance Review System*:
  - **Job Leveling (`L1 Junior` / `L2 Mid` / `L3 Senior` / `L4 Lead`)** visible across Super Admin, HR, Manager, Employee, and 9-Box chips.
  - **OKR Focus + Manager Co-Edit:** Employees draft OKRs (`Weight = 100%`), Managers can directly adjust `Weight %` and `Multiplier (1.0x/1.1x/1.2x)` during approval with transparent before/after diff logging.
  - **3-Stage Due Dates & Subtle Colorful Status Strip:** HR sets Stage 1 (OKR Draft), Stage 2 (Manager 5d SLA), and Stage 3 (HRBP Audit & Publish — HR Fixed date). Each stage shows its due date + dynamic timing chips (`Done Xd early`, `Done on time`, `Xd left`, `Overdue Xd`).
  - **HRBP Advisor / Facilitator Intervention:** Cases breaching Manager SLA or reaching Ping-Pong Round 2+ trigger HRBP alerts with 1-click advisor comment facilitation (without overriding manager ownership).
  - **Approach A (Lean v1):** Removed Calibration lock button from v1 → single clean **`HR Approve & Publish`** (`MANAGER_APPROVED` → `PUBLISHED`) so Part 2 Q2 ("requirement change to add Cross-Team Calibration before launch") aligns 100%.
  - **Strict 4-Role Activity Log (`GET /api/v1/activity-logs` + `ActivityLogPanel.jsx`):** Server-side & client-side role-scoped privacy (`Super Admin` = System & Governance, `HR Admin` = Org Operational, `Manager` = Own Team Only, `Employee` = Own Review Safe Only — zero unpublished score or bias alert leaks).
- **Language:** English (`en`) default with 1-click toggle to natural, idiomatic Thai (`th`).

---

## 2. Architecture & Role Boundaries (Pure JS ONLY)
- **Hard Rule:** Zero TypeScript (`.ts` / `.tsx`). Strict Pure JavaScript (`.js`, `.jsx`) across both apps.
- **Root Workspace Scripts (`package.json`):** `npm run dev` (backend `5001` + frontend `5173`), `npm run dev:front`, `npm run dev:back`, `npm run lint`, `npm run build`, `npm test`.
- **`frontend/` (Port `5173`):** React `19.3.1`, Vite `8.3.8`, Tailwind CSS `4.3.5`, `lucide-react`, `axios`, `react-router-dom`, `oxlint`. Zero heavy chart/animation libraries (`motion` & `recharts` permanently banned). Brand CI locked: **"Nordic Slate & Electric Cobalt"** (WCAG 2.1 AA, opaque floating layers, text-only `empeo` wordmark).
- **`backend/` (Port `5001`):** Node.js ESM, Express `5.3.0`, Prisma `6.19.3` (Supabase Dual-URL), Zod `4.6.7`, JWT, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `morgan`.
- **1-Office-Unit Demo Roster (16 Users):** 1 Super Admin (`EMP-0001`), 2 HR Admins (`EMP-1001`–`1002`), 3 Managers (`EMP-2001`–`2003`), 6 Active Employees (`EMP-3001`–`3006`), 4 Pending New Employees (`EMP-3091`–`3094`). Clean Login card + Gold bypass button (`คลิกเพื่อจำลองdemo`) → 2-level Role → Person drill-down picker.

---

## 3. Verification Results (Latest)
| Check | Command | Result |
| :--- | :--- | :--- |
| Backend unit, RBAC & Activity Log privacy tests | `npm test` | **PASS** (`9/9` passed — including 4-role Activity Log zero-leak test, OKR co-edit diff, HRBP Advisor Comment, Approach A Publish Gate, `409` Published State Guards, Dept Manager Mapping) |
| Prisma schema validation & DB push | `npm --prefix backend run prisma:validate && prisma:push && prisma:seed` | **PASS** (All 6 tables synced to Supabase `ap-southeast-1` and seeded with 16 users, 12 goals, 6 reviews, 7 audit logs) |
| Supabase live persistence across restart | `initStore()` → `updateCycle()` → `flushStore()` → `resetStore()` → `initStore()` | **PASS** (Changes persist to Supabase and reload accurately after simulated restart; `NODE_ENV=test` stays isolated in `memory-fallback`) |
| Frontend linter | `npm run lint` | **PASS** (`oxlint`: 0 warnings, 0 errors across 36 files) |
| Frontend production build | `npm run build` | **PASS** (`vite build`: `360ms`, `131.11 kB` gzip) |
| `autoBalanceWeights` self-check | `node -e ...` | **PASS** (`5/5` uneven & zero-weight cases balance to exact `100%` with every goal `>= 5%`) |
| Live Browser QA | Desktop `1440x900` + Mobile `375x812` | **PASS** (0 console errors; all 4 roles bottom Activity Log, `TieredSelect`, `ReturnFeedbackCard`, Starter Templates + Toast + `Auto-Balance 100%`, `NextActionBanner`, item-named evidence error, and `375px` mobile zero-overflow verified) |

---

## 4. Completed Handover Notes (2026-11-24)
- **[DONE] GitHub Remote Connected & Pushed:** `origin` is set to `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git` on branch `main` (tracking `origin/main`).
- **[DONE] Live Supabase PostgreSQL Persistence Wired:**
  - `backend/src/services/prismaClient.js` lazily initializes Prisma Client only when `env.storageMode === 'prisma'`.
  - `backend/src/services/storeService.js` hydrates full state from Supabase on startup (`initStore()`) and writes through every mutation (`updateCycle`, `createUser`, `updateUser`, `setRolePermission`, `replaceGoalsForEmployee`, `updateReview`, `appendReviewComment`, `appendAuditLog`) via a serialized persistence queue (`flushStore()` / `closeStore()`).
  - `backend/src/server.js` awaits `initStore()` before listening and flushes pending writes on `SIGINT`/`SIGTERM`.
  - `backend/src/config/env.js` & `backend/package.json` force `memory-fallback` when `NODE_ENV=test` so `npm test` never touches the live Supabase DB.
  - Supabase DB (`fnhbpwvirnjxulfeoljf`, `aws-1-ap-southeast-1.pooler.supabase.com`) has all 6 tables pushed and seeded. Local `backend/.env` and `frontend/.env` are configured and gitignored (never committed).

## 5. Open Items & Completed 4-Phase Quality Hardening (2026-11-24)
1. **4-Phase Skill-Audited Quality Hardening (`GOFIVE-OKRs.git`) — ALL COMPLETE:**
   - **Phase A (Docs & Rules Sync):** DONE (`bec0766`)
   - **Phase B (Backend `409` State Guards & Dept Manager Mapping):** DONE (`37a4f94`, `9/9` tests pass)
   - **Phase C (Native `<dialog>`, Dynamic Overdue, Local Date Parsing, Segmented Stage Bar, Table/Form A11y):** DONE (`0257f97`)
   - **Phase D (Zero Raw Enum Badges, 100% EN/TH Copy, 0-OKR Empty State, KPI Hierarchy, `>= 40px` Touch Targets):** DONE
2. **Public Deployment:** Deploy frontend & backend preview link (set `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` [32+ chars], `CORS_ORIGINS`, `NODE_ENV=production` on backend host, and `VITE_API_BASE_URL` on frontend host).
3. **Part 2 Written Answers (`docs/plan.md` & `docs/note.md`):** Updated with all 3 real AI collaboration examples for Q3.
4. **UI/UX Polish & Zero-Learning-Curve / Gen-Gap Sprint (2026-11-25) — ALL COMPLETE & PUSHED:**
   - **Activity Log at Bottom (`caef65a`):** Anchored full-width at the bottom of all 4 role pages (`SuperAdminPage`, `HrDashboardPage`, `ManagerWorkspacePage`, `EmployeeWorkspacePage`).
   - **Color-Coded Tiered Dropdowns (`caef65a`):** `TieredSelect.jsx` with `appearance: base-select` progressive enhancement (`modern-web-guidance: branded-select-styling`) across Role (`T1–T4`), Job Level (`L1–L4`), Difficulty Multiplier (`1.0x–1.2x`), Measurement Mode, Self Score (`1–5`), and Department.
   - **Return Cards, Accessible Toast & Actionable Errors (`3e06426`):** `ReturnFeedbackCard.jsx` (who returned, round, quoted comment, 3-step fix guide, HRBP note), persistent pre-mounted `ToastBar.jsx` (`ariaNotify` + live region + hover/focus pause), and specific EN/TH validation errors naming exact missing OKRs/char counts.
   - **Zero-Learning-Curve & Close Gen-Gap (`3901521` + `showToast` fix):** 6-department 1-click Starter OKR Templates (`okrTemplates.js`), Quick Importance buttons (`50/30/20%`) + 1-click `Auto-Balance 100%`, 3 measurement modes (`Numeric` / `Milestone Checklist` / `Service Quality`), `NextActionBanner.jsx`, 3-Question Evidence Prompt chips, `localStorage` Auto-Save badge, and Preview & Confirm Submit dialog.
   - **Enterprise Copy & `StageStatusBar` Polish (`fe3cba9`):** Removed all 25 informal/over-explained UI strings across EN & TH (`Ping-Pong` → `Revision Round`, `No Mental Math` → `Priority`, `Hit Date` → `Target Date`, `Nudge` → `Send Reminder`, color-independent banners, zero `ครับ`/`!` in UI, translated 9-Box axis labels, clean Thai labels without redundant English parens) and fixed `StageStatusBar.jsx` so upcoming stages not yet reached display `Pending prior stage` (`รอขั้นก่อนหน้า`) instead of false `Overdue` warnings.
   - **Tailwind CSS v4 Canonical Class Cleanup (`aa0454e`):** Migrated all 751 `-[var(--...)]` classes across 21 JSX files to Tailwind v4 canonical `-(--...)` syntax, plus `break-words` → `wrap-break-word` and `active:scale-[0.98]` → `active:scale-98` to eliminate all `tailwindcss(suggestCanonicalClasses)` IDE warnings.
   - **HR Governance, 9-Box Heat-Map & Org Hierarchy Clarity:** Locked HR `EvaluationDrawer` to `readOnly` (Inspect-Only mode + direct `Return to Manager` CTA), added batch-aware Publish Confirmation `<ModalDialog>`, upgraded `NineBoxGrid.jsx` with spacious 9-zone diagonal heat-map colors & sleek borderless color rails alongside a compact `OrgDistributionBar`, added HRBP Assigned Department Scope toggle (`All Org` vs `My Assigned Teams`), surfaced Reporting Manager on Employee Workspace, and upgraded Manager Workspace with a scalable Direct Reports count header + Search & 1-Click Status Filter Chips (`All / OKRs Pending / Pending Review / Overdue / Completed`) for 40+ report teams.
   - **Enterprise Invite & Activate Onboarding + Live HR Reminder Banners (`4c479a4`):** Added `+ Invite Employee` modal on `SuperAdminPage` generating 6-digit activation codes (`INVITED` status + copyable code chip in directory), upgraded `RegisterPage` into 2-tab Employee Onboarding (`Activate Account` via 6-digit Invite Code + `Request Access` fallback), and wired live `HR Reminder` banners onto both `EmployeeWorkspacePage` and `ManagerWorkspacePage` whenever HR triggers `Send Reminder`.
   - **Enterprise Copy Polish (Round 2 — 14 Items) & Standing Auto-Gates (`4d2028d`):** Cleaned all 14 remaining informal/over-explained/redundant-paren strings in `translations.js` and codified **Automatic Enterprise Copy Hygiene Gate** + **Automatic Handover/Status-Log/Git-Push Gate** into `docs/rules/00-core-workflow-and-governance.md`.
   - **Full-System Security Audit & Hardening + Exception UX Polish (`7e801e1` + `2bc552c`):** Closed all Security (`S1` prod `demo-switch` 403 gate, `S2` removed `HR_ADMIN` from backend `PUT /manager-review`, `S4` CSPRNG `crypto.getRandomValues` + 72h TTL for 6-digit invite codes) and QA/QC polish items (`Q1` `NineBoxGrid` explicit border colors with 0 React console warnings, `Q2` single clear button on Manager search, `Q3` dynamic user count on Demo Picker). Added custom Extend Deadline (`+2/+5/+7` presets + `1–30` custom days), viewport-fixed hover tooltips on all 4 Exception Queue buttons, `Actor → Recipient` badges in `ActivityLogPanel`, and Reporting Manager in `EvaluationDrawer` header.
   - **Employee Core Competencies (How) Self-Assessment (`2c29ab2`):** Added 1–5 Core Competencies self-rating + behavioral anchor + example note (with `localStorage` auto-save) to `EmployeeWorkspacePage.jsx` and surfaced each employee's self-score & self-note directly inside `EvaluationDrawer.jsx` for managers to review side-by-side.
   - **Manager → HR OKR Amendment Unlock Flow (`3d75e80`):** Managers can click `Request OKR Unlock` on locked post-Stage-1 reviews with a mandatory reason (`ReasonModal`); HR sees pending requests at the top of `ExceptionQueue` and can `Approve Unlock` (transitions back to `GOAL_REVISION_REQUIRED` so the employee can add/edit OKRs) or `Decline`, with full `Actor → Recipient` Activity Log tracking. *(Parked future item: Dual-Hat `My OKRs` tab for Manager/HR).*
   - **Official Product Architecture & User Demo Guide PDF (`docs/empeo-user-demo-tester-guide.pdf`):** Upgraded to 17-page A4 executive PDF (`2.2 MB`) featuring **Key Highlights & Core Capabilities**, **Tech Stack**, **6-Table SVG ERD**, **Detailed Application Mechanics** (Dual-Axis Scoring Engine, Guardrails, User Workflow), **11 live English (`EN`) UI snapshots**, and **6 End-to-End Test Scenarios & Success Cases** (removed QA/QC Sign-Off Checklist; screened 0 informal copy leaks).
   - **Branding & Matrix Naming Update:** Renamed app title/wordmark to **`empeo - ClarifyHRPlatform`** and replaced `9-Box` UI labels with **`Impact & Competency Map`** (`แผนผังผลลัพธ์และสมรรถนะ`) across HR Dashboard, Employee Results, Super Admin Permission Matrix, and Demo Picker.
   - **Pre-Vercel Full QA/QC & Security Hardening (2026-11-26):** Fixed Zod boolean coercion bug (`ENABLE_DEMO_MODE="false"` strictly parses `false`), gated `GET /api/v1/auth/demo-accounts` in production with rate-limiting, enabled `trust proxy` + hardened `helmet` headers, masked internal health metadata in production, enforced 72-hour `inviteExpiresAt` check on invite activation, removed unused `onSaveEvaluation` prop from `HrDashboardPage`, added `React.lazy` + `<Suspense>` code splitting (`105.09 kB` gzip main chunk, 0 Vite warnings, 0 frontend vulnerabilities), created root `vercel.json` + `frontend/vercel.json` with strict CSP/HSTS/anti-clickjacking/`noindex` headers, and verified **0 secrets leaked in `dist/`**, **10/10 backend tests PASS**, and **7/7 Production-Build Browser QA/QC PASS** (0 console errors, 0 failed requests).
   - **Browser-Isolated `localStorage` Persistence + 1-Click `Reset Demo` (2026-11-26):** Persisted all sandbox mutations (newly registered/activated accounts, 6-digit invites, OKRs, evaluations, audit logs, active session) to `localStorage` (`empeo-clarify-demo-state-v1`) with salted 64-bit credential hashing (zero plaintext passwords stored) and added a confirmed **`Reset Demo`** action in both `AppShell` and `DemoRolePickerPage` so Vercel reviewers can register real accounts, refresh the page (`F5`) without losing data, and reset cleanly anytime.
