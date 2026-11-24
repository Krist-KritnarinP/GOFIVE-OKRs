# Project Handover — empeo Performance Management Prototype (`GOFIVE TEST`)

**Last Updated:** 2026-11-24  
**Current Milestone:** Phase 3.6 Complete — **Job Leveling, 3-Stage Due Dates (+ Countdown/Overdue/Early Chips), Manager OKR Co-Edit, HRBP Advisor Intervention, Approach A (`HR Approve & Publish`), Strict 4-Role Activity Log, GitHub Remote Sync, and Live Supabase PostgreSQL Persistence (Prisma Dual-URL)**  
**Next Action:** Deploy public prototype link (Frontend + Backend with Supabase env vars) for Gofive PO Assignment submission and finalize Part 2 written answers.

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
| Backend unit, RBAC & Activity Log privacy tests | `npm test` | **PASS** (`8/8` passed — including 4-role Activity Log zero-leak test, OKR co-edit diff, HRBP Advisor Comment, Approach A Publish Gate) |
| Prisma schema validation & DB push | `npm --prefix backend run prisma:validate && prisma:push && prisma:seed` | **PASS** (All 6 tables synced to Supabase `ap-southeast-1` and seeded with 16 users, 12 goals, 6 reviews, 7 audit logs) |
| Supabase live persistence across restart | `initStore()` → `updateCycle()` → `flushStore()` → `resetStore()` → `initStore()` | **PASS** (Changes persist to Supabase and reload accurately after simulated restart; `NODE_ENV=test` stays isolated in `memory-fallback`) |
| Frontend linter | `npm run lint` | **PASS** (`oxlint`: 0 warnings, 0 errors across 30 files) |
| Frontend production build | `npm run build` | **PASS** (`vite build`: `573ms`, `115.77 kB` gzip) |
| Live Browser QA | Desktop `1440x900` + Mobile `375x812` | **PASS** (0 console errors, StrictMode duplicate-log bug fixed, HR Admin Mobile `375px` overflow fixed, EN/TH timing chips verified) |

---

## 4. Completed Handover Notes (2026-11-24)
- **[DONE] GitHub Remote Connected & Pushed:** `origin` is set to `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git` on branch `main` (tracking `origin/main`).
- **[DONE] Live Supabase PostgreSQL Persistence Wired:**
  - `backend/src/services/prismaClient.js` lazily initializes Prisma Client only when `env.storageMode === 'prisma'`.
  - `backend/src/services/storeService.js` hydrates full state from Supabase on startup (`initStore()`) and writes through every mutation (`updateCycle`, `createUser`, `updateUser`, `setRolePermission`, `replaceGoalsForEmployee`, `updateReview`, `appendReviewComment`, `appendAuditLog`) via a serialized persistence queue (`flushStore()` / `closeStore()`).
  - `backend/src/server.js` awaits `initStore()` before listening and flushes pending writes on `SIGINT`/`SIGTERM`.
  - `backend/src/config/env.js` & `backend/package.json` force `memory-fallback` when `NODE_ENV=test` so `npm test` never touches the live Supabase DB.
  - Supabase DB (`fnhbpwvirnjxulfeoljf`, `aws-1-ap-southeast-1.pooler.supabase.com`) has all 6 tables pushed and seeded. Local `backend/.env` and `frontend/.env` are configured and gitignored (never committed).

## 5. Open Items for Next Session
1. **Public Deployment:** Deploy frontend & backend preview link (remember to set `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` [32+ chars], `CORS_ORIGINS`, `NODE_ENV=production` on backend host, and `VITE_API_BASE_URL` on frontend host).
2. **Part 2 Written Answers (`docs/plan.md` & `docs/note.md`):** Ready for final polish/export before Gofive PO submission.
