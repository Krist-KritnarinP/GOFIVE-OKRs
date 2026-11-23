# Project Handover — empeo Performance Management Prototype (`GOFIVE TEST`)

**Last Updated:** 2026-11-23  
**Current Milestone:** Phase 2 (Full Backend API + RBAC Tests + 3-Role Frontend Prototype) Complete — **Gate 2 PASSED**  
**Next Gate:** **Quality Gate 3** — Browser visual/responsive verification (Desktop/Tablet/Mobile), QA/Anti-slop audit (`docs/agent-hub/04-qa-report.md`), Deployment link, and Part 2 Q1–Q3 finalization.

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
- **`docs/` (Central Non-Code Documentation):**
  - `docs/guidelines.md` — Master guidelines index pointing to strict role-separated rules in `docs/rules/` (`00-core-workflow-and-governance.md`, `01-frontend-rules.md`, `02-backend-and-security-rules.md`, `03-skills-and-tooling.md`)
  - `docs/handover.md` — Canonical handover document
  - `docs/note.md` — Central project notes & Part 2 Q1–Q3 scratchpad
  - `docs/agent-hub/` (PM / PO): `00-brief.md`, `01-api-contract.md`, `02-ui-spec.md`, `03-security-baseline.md`, `04-qa-report.md`, `99-status-log.md`
- **`frontend/` (Dev Front — Port `5173`):** React `19.3.1` (`.jsx`), Vite `8.3.8`, Tailwind CSS `4.3.5`, `lucide-react` `1.78.0`, `axios` `1.21.1`, `react-router-dom` `7.18.6`, `oxlint` `1.94.0`.
  - **Brand CI Locked:** **"Nordic Slate & Electric Cobalt"** (`#F6F7F9` canvas, `#FFFFFF` opaque surfaces, `#0F172A` text, `#0052FF` Electric Cobalt primary CTA max 5% viewport, 4 locked WCAG AA semantic status pairs) in `frontend/src/index.css`.
  - **Zero Heavy Libraries & 0ms Instant UI:** `motion` and `recharts` removed per guardrail; 9-Box Performance Grid & Org Distribution Bar will be built with pure semantic HTML, Tailwind CSS Grid, lightweight inline SVG, and `150ms` CSS-only transitions. Zero glassmorphism (`backdrop-blur` banned).
- **`backend/` (Dev Back — Port `5001`):** Node.js ESM (`.js`), Express `5.3.0`, Prisma `6.19.3` (Supabase Dual-URL), Zod `4.6.7`, `jsonwebtoken` `9.0.3`, `bcryptjs` `3.0.3`, `helmet` `8.3.0`, `cors` `2.8.6`, `express-rate-limit` `8.7.5`, `morgan` `1.12.1`, `dotenv` `18.0.10`.

---

## 3. Key Decisions & Rationale
1. **Nordic Slate & Electric Cobalt + Zero Heavy Libraries:** Locked exact Swiss Grid enterprise color system, strict WCAG 2.1 AA opaque floating layers (zero glassmorphism), `0ms` instant state updates, and removed `motion`/`recharts` in favor of pure HTML/Tailwind Grid/inline SVG for maximum speed and razor-sharp rendering.
2. **Prisma `6.19.3` (pinned latest stable 6.x):** `prisma@latest` on npm resolved to `8.0.0-rc.34` (RC — forbidden by guidelines) and Prisma 7 requires `prisma.config.ts` (TypeScript). Prisma `6.19.3` is the latest GA release supporting Pure JS + native Supabase Dual-URL (`url` + `directUrl`) in `schema.prisma`.
3. **Storage Mode (`prisma` or `memory-fallback`):** `backend/src/config/env.js` automatically runs in `memory-fallback` when `DATABASE_URL` is omitted so local dev & prototype demos work immediately while remaining 100% ready for Supabase PostgreSQL.

---

## 4. Verification Results
| Check | Command | Result |
| :--- | :--- | :--- |
| Backend smoke & security headers test | `cd backend && npm test` | **PASS** (1/1 passed — `/api/v1/health` 200 OK, `x-content-type-options: nosniff`, `x-powered-by` disabled) |
| Prisma schema validation | `cd backend && DATABASE_URL=... DIRECT_URL=... npx prisma validate` | **PASS** (`prisma/schema.prisma` valid) |
| Frontend linter | `cd frontend && npm run lint` | **PASS** (`oxlint`: 0 warnings, 0 errors across 8 files) |
| Frontend production build | `cd frontend && npm run build` | **PASS** (`vite build` succeeded in 319ms; `328.60 kB` / `107.76 kB` gzip; `0 vulnerabilities`) |
| Browser visual verification | Not yet run (Phase 0 scaffold only; scheduled for Phase 2/3) | Pending |

---

## 5. Environment Variables (Names Only — Never Commit Secrets)
- **Backend (`backend/.env` from `backend/.env.example`):** `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DATABASE_URL` (Supabase PgBouncer 6543), `DIRECT_URL` (Supabase Direct 5432).
- **Frontend (`frontend/.env` from `frontend/.env.example`):** `VITE_API_BASE_URL`.

---

## 6. Known Blockers / Open Items for Next Session
1. **GitHub Remote URL:** Local Git repo initialized on branch `main`, but **no remote push performed** — awaiting user's new GitHub repository URL for `GOFIVE TEST` (must NOT push to `living-wealth-365.git`).
2. **Backend `npm audit` note:** `backend` reported 6 transitive audit advisories from `npm install`; review before production deployment.
3. **Next Concrete Actions:**
   - User approves **Gate 1** (`docs/agent-hub/00`–`03`) and confirms GitHub remote URL.
   - Enter **Phase 2** (recommend `/teamwork` for parallel Dev Back + Dev Front execution).
