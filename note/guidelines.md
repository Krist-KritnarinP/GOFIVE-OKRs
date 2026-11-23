# Engineering Guidelines, Standing Rules & Multi-Agent Governance

## 1. Mandatory 5-Step Workflow (กติกาการทำงาน 5 ขั้นตอนก่อนลงมือเสมอ)
Before writing code, modifying files, or running state-changing commands, every agent MUST follow these 5 steps:
1. **Clarify Direction (ถามคำถามจัดแนวทาง):** Ask concise questions whenever ambiguity affects design, architecture, or outcomes.
2. **Recommend Approach, Skills & Tech Stack (แนะนำแนวทาง + Skill + Tech Stack):** Present options with **Capabilities, Pros, and Cons**. *(Exception: trivial 1-line edits may abbreviate this step, but must still restate the task and summarize.)*
3. **Restate Task & Summarize Plan (ทวน Task และสรุปแผนงาน):** Clearly state scope, affected files, and expected outcomes.
4. **Execute After Alignment (รอการยืนยันแล้วค่อยลงมือทำ):** Never make large or structural changes without user confirmation.
5. **Summarize, Handover & Push (สรุปผล + อัปเดตเอกสาร + Git):** Summarize changes and verification results, update `handover.md` and `docs/agent-hub/99-status-log.md`, and run `git commit` + `git push origin main` *(once the project's GitHub remote URL is confirmed by the user)*.

---

## 2. Hard Technical Mandates
- **Pure JavaScript ONLY — NO TypeScript:** Both `frontend/` (`.js`, `.jsx`) and `backend/` (ES Modules `.js`) must strictly use Pure JavaScript. Do NOT create `.ts` or `.tsx` files.
- **Clean Code & Component Decomposition:**
  - Single Responsibility Principle — no monolithic giant files.
  - Organize `frontend/src/` cleanly: `components/`, `pages/`, `constants/`, `services/`, `hooks/`, `i18n/`.
  - Organize `backend/src/` cleanly: `routes/`, `controllers/`, `services/`, `middleware/`, `schemas/`, `data/`.
  - Refactor dead code, remove unused imports, and leave no TODO/placeholder logic in required flows.
- **UI Layout, Accessibility & Anti-Slop Mandate:**
  - **Full Screen 100% Edge-to-Edge:** Use full viewport width cleanly without wasted side margins.
  - **Universal Responsiveness:** Mobile (all sizes), Tablet/iPad (portrait & landscape), and Desktop.
  - **Typography for All Ages:** Readable font sizes, strong contrast (WCAG AA+), clear visual hierarchy suitable for all genders and age groups.
  - **Brand CI Tokens:** Keep colors strictly in semantic CSS custom properties (`frontend/src/index.css`) until Brand CI is finalized so theme updates happen in one place.
  - **Bilingual Copy (EN Default + Natural TH):** English is the primary language with a 1-click toggle to natural, idiomatic Thai HR/business copy (never literal word-for-word machine translation).
- **Dependencies:** Install only necessary, latest stable GA packages verified against npm registry. Never use alpha/beta/RC/canary releases.
- **Security & Privacy Release Gate:**
  - Validate all untrusted input server-side with **Zod**.
  - Enforce **Authentication & RBAC** on the server for every protected route (hiding UI elements is NOT authorization).
  - Never expose unpublished review results to employees via API.
  - Never commit secrets or `.env` files to Git.

---

## 3. Multi-Agent Role Boundaries (สิทธิ์การแก้ไฟล์)
| Role | Primary Responsibility | File Edit Permissions |
| :--- | :--- | :--- |
| **PM / PO** | Break down requirements, User Stories, Acceptance Criteria, API/UI Specs | `docs/agent-hub/` ONLY (no source code) |
| **Dev Front** | Build UI per `02-ui-spec.md` and integrate per `01-api-contract.md` | `frontend/` ONLY |
| **Dev Back** | Build API, DB/Prisma, Security, Business Logic, Unit Tests per Contract | `backend/` ONLY |
| **QA / QC & Tester** | Run real tests, verify AC, security checks, and UI/anti-slop review (`hallmark` / `anti-slop-craft`) | Read all + write tests & `docs/agent-hub/04-qa-report.md` (no silent logic edits) |
| **Reporter** | Summarize status, release notes, pass/fail blockers in one readable view | Read-only + summary reports / `handover.md` |

---

## 4. Quality Gates (กติกาการส่งต่อ)
- **Gate 1 (Before Dev starts):** `00-brief.md`, `01-api-contract.md`, `02-ui-spec.md`, and `03-security-baseline.md` must exist in `docs/agent-hub/` and be approved by the user.
- **Gate 2 (Before QA starts):** Both Dev Front and Dev Back must pass `lint`, `build`, and `test`, and log changes in `docs/agent-hub/99-status-log.md`.
- **Gate 3 (Before Release):** QA/Tester must verify all Functional AC, Edge/Overdue states, Security/RBAC checks, and Anti-Slop UI review with zero Critical/High defects remaining.

---

## 5. Multi-Agent Collaboration Rules
- **Context Sync:** Every agent MUST read `docs/agent-hub/99-status-log.md` and `handover.md` before starting, and update `99-status-log.md` upon completion.
- **Parallel Work:** When Dev Front and Dev Back work simultaneously, use `/teamwork` (isolated workspaces) to prevent merge/write conflicts.
- **Right-Sized Delegation:** Use a single agent for small fixes; reserve the full multi-agent pipeline for new milestones and major features.
