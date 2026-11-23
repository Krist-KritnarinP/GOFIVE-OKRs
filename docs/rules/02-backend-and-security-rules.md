# 02 — Backend Engineering, Database & Security Release Gate (Strict Mandate)

> **Applies to:** Dev Back (`backend/` ONLY) & QA/QC (Security & API Audit)

---

## 1. Pure JavaScript & Clean Architecture Mandate
- **ห้ามใช้ TypeScript เด็ดขาด:** โค้ดทั้งหมดใน `backend/` ต้องเป็น Pure JavaScript ES Modules (`"type": "module"`, `.js`) เท่านั้น
- **Clean Architecture Decomposition:** แยกหน้าที่ชัดเจน ไม่กองทุกอย่างใน `server.js` / `app.js`:
  - `src/config/` (env validation, DB client)
  - `src/routes/` (route definitions)
  - `src/controllers/` (HTTP request/response handling)
  - `src/services/` (business logic & deterministic calculations)
  - `src/middleware/` (auth, RBAC, validation, error handler)
  - `src/schemas/` (Zod request/response validation schemas)
  - `src/data/` (seed/fallback data when applicable)
  - `tests/` (automated unit & API security tests)

---

## 2. Security and Privacy: Release Gate (ห้ามตกหล่นเด็ดขาด)
- **Zero Trust on Inputs:** Treat all user input, uploaded files, external services, model output, and client state as untrusted. Validate all inputs on the server using **Zod**.
- **Server-Side Auth & Authorization:** Enforce authentication, authorization (RBAC), record ownership, and tenant isolation on every protected operation; **hiding a UI element is NOT authorization**.
- **Secrets Hygiene:** Keep secrets strictly on the server and out of source control, browser bundles, logs, screenshots, tests, and handover notes. Use least privilege and approved `.env` configuration (`.gitignore` blocks `.env*` except `.env.example`). Minimize collected personal data and redact sensitive diagnostic information.
- **Threat Controls:** Evaluate and mitigate applicable threats: injection (SQLi via parameterized Prisma queries), XSS, CSRF, unsafe redirects, SSRF, insecure uploads, path traversal, session misuse, cross-user data exposure, abusive requests (rate limiting), and dependency vulnerabilities. Use established security primitives (`jsonwebtoken`, `bcryptjs`, `helmet`, `cors`) rather than homemade cryptography or auth.
- **Mutation Safety:** For critical mutations, handle concurrency, duplicate requests, retries, partial failures, and transaction consistency. Do not bypass business validation or authorization to make tests pass. Avoid exposing internal errors/stack traces or returning success when an operation failed.
- **Hard Release Gate:** Do NOT publish, deploy, merge, or describe code as ready for production when a known exploitable vulnerability remains in the changed flow, or a critical security check is failing or unverified. Fix issues within authorized scope; otherwise provide a concrete blocker and required remediation. Never promise absolute security; state evidence and remaining limits.

---

## 3. Backend, Database & Infrastructure Baseline
- **Port (Local):** `5001`
- **Core Packages (verify latest stable via `npm view` before install):**
  - Dependencies: `express`, `@prisma/client`, `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `morgan`, `dotenv`
  - DevDependencies: `prisma`, `nodemon`
- **Database:** Supabase PostgreSQL with **Dual-URL** configuration in `prisma/schema.prisma`:
  - `DATABASE_URL` — PgBouncer pooled connection (Port `6543`) for app runtime
  - `DIRECT_URL` — Direct connection (Port `5432`) for Prisma migrations / `db push`
  - *(Note: Pin latest stable Pure-JS-compatible Prisma GA release, e.g., Prisma 6.x — never RC releases.)*
- **Optional Media Storage (install ONLY when project requires file uploads):**
  - Cloudflare R2 via `@aws-sdk/client-s3` + `multer` (enforce file type, size limits, and sanitized keys on server).
