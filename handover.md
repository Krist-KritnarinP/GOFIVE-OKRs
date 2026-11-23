# Project Handover — empeo Performance Management Prototype (`GOFIVE TEST`)

**Last Updated:** 2026-11-23  
**Current Milestone:** Phase 0 (Foundation Scaffold) + Phase 1 (Gate 1 Specifications) Complete  
**Next Gate:** **Quality Gate 1** — User review & approval of `docs/agent-hub/00`–`03`, Brand CI palette selection, and new GitHub remote URL before Phase 2 implementation.

---

## 1. Objective & Scope
Build a working, clickable web prototype for **empeo Performance Management** (HRM + HRD) solving:
> *How do we make annual performance reviews fair across an entire organization, and genuinely surface who the high performers and low performers are?*

- **Core Product Concept:** *Evidence-First & Dual-Axis Performance Review System* (Shared 1–5 Behavioral Anchors + Evidence-Required extreme ratings `1/2/5` + Dual-Axis `What/How` Talent Matrix + Manager Bias Alerts + Multi-Role `HR Admin / Manager / Employee` + Overdue Exception Handling + Publish Gate).
- **Language:** English (`en`) default with 1-click toggle to natural, idiomatic Thai (`th`).
- **Scope Details & Acceptance Criteria:** See `docs/agent-hub/00-brief.md`.

---

## 2. Architecture & Role Boundaries (Pure JS ONLY)
- **Hard Rule:** Zero TypeScript (`.ts` / `.tsx`). Strict Pure JavaScript (`.js`, `.jsx`) across both apps.
- **`docs/agent-hub/` (PM / PO):**
  - `00-brief.md` — Product brief, v1 vs. out-of-scope, User Stories & AC
  - `01-api-contract.md` — REST API contract, Zod validation, RBAC rules, Review State Machine, Prisma models
  - `02-ui-spec.md` — Neutral semantic tokens, Full-screen responsive layout, 3 Role views, EN/TH natural copy guide
  - `03-security-baseline.md` — OWASP controls, Helmet/CORS/Rate-Limit, server-side unpublished score stripping
  - `04-qa-report.md` — Gate 3 verification template
  - `99-status-log.md` — Shared team log
- **`note/guidelines.md`:** Standing 5-step workflow, Clean Code, Security Gate, and Multi-Agent governance.
- **`frontend/` (Dev Front — Port `5173`):** React `19.3.1` (`.jsx`), Vite `8.3.8`, Tailwind CSS `4.3.5`, `motion` `14.14.0`, `recharts` `3.11.0`, `lucide-react` `1.78.0`, `axios` `1.21.1`, `react-router-dom` `7.18.6`, `oxlint` `1.94.0`.
  - Brand CI palette is intentionally held in semantic CSS variables (`frontend/src/index.css`) so the next session's Brand CI choice applies in 1 file.
- **`backend/` (Dev Back — Port `5001`):** Node.js ESM (`.js`), Express `5.3.0`, Prisma `6.19.3` (Supabase Dual-URL), Zod `4.6.7`, `jsonwebtoken` `9.0.3`, `bcryptjs` `3.0.3`, `helmet` `8.3.0`, `cors` `2.8.6`, `express-rate-limit` `8.7.5`, `morgan` `1.12.1`, `dotenv` `18.0.10`.

---

## 3. Key Decisions & Rationale
1. **Tailwind CSS v4 Custom Craft + `motion` + `recharts`:** Chosen over DaisyUI 5 to avoid template aesthetics, support bespoke enterprise HR micro-interactions, and keep typography/contrast fully controlled for all age groups.
2. **Prisma `6.19.3` (pinned latest stable 6.x):** `prisma@latest` on npm resolved to `8.0.0-rc.34` (RC — forbidden by guidelines) and Prisma 7 requires `prisma.config.ts` (TypeScript). Prisma `6.19.3` is the latest GA release supporting Pure JS + native Supabase Dual-URL (`url` + `directUrl`) in `schema.prisma`.
3. **Storage Mode (`prisma` or `memory-fallback`):** `backend/src/config/env.js` automatically runs in `memory-fallback` when `DATABASE_URL` is omitted so local dev & prototype demos work immediately while remaining 100% ready for Supabase PostgreSQL.

---

## 4. Verification Results
| Check | Command | Result |
| :--- | :--- | :--- |
| Backend smoke & security headers test | `cd backend && npm test` | **PASS** (1/1 passed — `/api/v1/health` 200 OK, `x-content-type-options: nosniff`, `x-powered-by` disabled) |
| Prisma schema validation | `cd backend && DATABASE_URL=... DIRECT_URL=... npx prisma validate` | **PASS** (`prisma/schema.prisma` valid) |
| Frontend linter | `cd frontend && npm run lint` | **PASS** (`oxlint`: 0 warnings, 0 errors across 8 files) |
| Frontend production build | `cd frontend && npm run build` | **PASS** (`vite build` succeeded in 334ms; `0 vulnerabilities`) |
| Browser visual verification | Not yet run (Phase 0 scaffold only; scheduled for Phase 2/3) | Pending |

---

## 5. Environment Variables (Names Only — Never Commit Secrets)
- **Backend (`backend/.env` from `backend/.env.example`):** `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DATABASE_URL` (Supabase PgBouncer 6543), `DIRECT_URL` (Supabase Direct 5432).
- **Frontend (`frontend/.env` from `frontend/.env.example`):** `VITE_API_BASE_URL`.

---

## 6. Known Blockers / Open Items for Next Session
1. **GitHub Remote URL:** Local Git repo initialized on branch `main`, but **no remote push performed** — awaiting user's new GitHub repository URL for `GOFIVE TEST` (must NOT push to `living-wealth-365.git`).
2. **Brand CI Palette:** User will decide Brand CI colors in the next session; update `:root` variables in `frontend/src/index.css`.
3. **Backend `npm audit` note:** `backend` reported 6 transitive audit advisories from `npm install` (likely Prisma/Express sub-dependencies); review before production deployment.
4. **Next Concrete Actions:**
   - User approves **Gate 1** (`docs/agent-hub/00`–`03`) and confirms Brand CI + Git remote.
   - Enter **Phase 2** (recommend `/teamwork` for parallel Dev Back + Dev Front execution).
