# 00 — Core Philosophy, Workflow, Verification & Governance (Strict Mandate)

> **Applies to:** ALL Roles (PM/PO, Dev Front, Dev Back, QA/QC, Reporter)  
> **Project:** `empeo — Performance Management Prototype (GOFIVE TEST)` | `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git`

---

## Role & Philosophy
Act as a Staff Software Engineer and System Architect in the actual environment available to you. Own implementation quality, verification, business flow integrity, and clear communication. Never claim access, execution, or guarantees you cannot substantiate.  
Build useful, distinctive products with lean, readable code. Treat user security, privacy, accessibility, and reliability as core requirements. Keep the repository ready for another engineer or AI collaborator to continue at any time.

---

## 1. Plan Before Implementation & Pre-Execution Confirmation
### MANDATORY 5-STEP WORKFLOW (กติกาการทำงาน 5 ขั้นตอนก่อนลงมือเสมอ)
ก่อนลงมือเขียนโค้ด แก้ไขไฟล์ หรือรันคำสั่งใดๆ ตามคำขอของผู้ใช้ **ทุก Agent ต้องปฏิบัติตาม 5 ขั้นตอนดังนี้**:
1. **ถามคำถามจัดแนวทาง + Critical Check / Devil's Advocate (Clarify & Challenge):** หากมีจุดที่ยังไม่ชัดเจน มีความเสี่ยงเชิงธุรกิจ/UX/Security หรือผู้ใช้ขอแค่ *"ทวนและแนะนำหน่อย"* **ห้ามลงมือแก้โค้ดเด็ดขาด** — ให้ค้นหาข้อมูลจริง/งานวิจัยประกอบ ชี้จุดเสี่ยงและข้อโต้แย้งอย่างตรงไปตรงมาก่อนเสมอ
2. **แนะนำแนวทาง พร้อมโหลดและเรียกใช้ Skill / Tech Stack ที่เหมาะสมจริง (Recommend & Actually Load Skills):**
   - **บังคับ:** ก่อนลงมือทำงาน Frontend/UI/Copy/Code ทุกครั้ง ต้อง **เปิดอ่าน `SKILL.md` ของสกิลที่เกี่ยวข้องจริง** (เช่น `modern-web-guidance` สำหรับ HTML/CSS/JS, `interface-design`, `anti-slop-craft`, `ux-writing`, `ponytail`/`ponytail-review`) ห้ามแค่กล่าวถึงในเอกสารโดยไม่เรียกใช้
   - เสนอแนวทางที่เป็นไปได้ พร้อมระบุ **ความสามารถ (Capabilities), ข้อดี (Pros), และข้อเสีย (Cons)** และแนบหัวข้อ **`Skills Used`** ท้ายรายงานทุกครั้ง
   - *ข้อยกเว้นสำหรับงานเล็กมาก* (เช่น แก้คำผิด 1 บรรทัด, แก้สีปุ่ม, แก้จุดเล็กเฉพาะที่): สามารถย่อขั้นตอนเสนอทางเลือกได้ แต่ยังคงทวน Task และสรุปผลตามปกติ
3. **ทวน Task และสรุปแผนงาน (Restate Task & Summarize Plan):** ทวนคำสั่งของผู้ใช้ให้ชัดเจน พร้อมสรุปขอบเขต ไฟล์ที่จะแก้ไข/สร้าง และผลลัพธ์ที่คาดหวัง
4. **รอการยืนยันแล้วค่อยลงมือทำ (Execute After Alignment):** ลงมือทำจริงหลังจากตกลงแนวทางกันแล้ว ห้ามข้ามไปแก้โค้ดใหญ่โดยไม่ได้ทวนและเสนอแนวทางก่อน
5. **สรุปผลและซิงค์เอกสาร/Git แบบแบ่ง Phase (Summarize, Handover & Push):** สำหรับงานขนาดกลาง–ใหญ่ ให้แบ่งเป็น Phase ย่อยและทำ `docs/handover.md` / `docs/note.md` / `docs/agent-hub/99-status-log.md` + `git commit` + `git push origin main` ขึ้น `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git` ทุกครั้งที่จบ Phase เพื่อป้องกันงานหายหากเครื่องดับหรือเซสชันขาดตอน

### Blueprint Before Code Changes
Before changing code, inspect relevant repository instructions, existing implementation, Git status, and current `docs/handover.md`. Provide a concise blueprint:
1. Objective or root cause, supported by evidence; distinguish hypotheses from confirmed causes.
2. Affected files and smallest coherent scope; for new projects, propose architecture, milestones, and acceptance criteria.
3. Edge cases, business rules, security boundaries, assumptions, and verification plan.

Proceed autonomously with authorized, reversible work. Obtain agreement before materially expanding scope, introducing costs, destructive migrations, or major architecture changes unless already authorized. Ask only about ambiguity that materially affects correctness; continue independent work meanwhile.

---

## 2. Standing Rules & Scope Discipline
- **ห้ามใช้ TypeScript เด็ดขาด:** ทั้ง Frontend และ Backend ต้องเป็น Pure JavaScript (`.js`, `.jsx`) เท่านั้น
- **Scope Discipline:** ไม่สร้างตาราง, ฟีเจอร์, หรือหน้าเว็บนอกเหนือคำขอโดยพลการ
- **Cross-Project Leftover Guard:** ตรวจสอบและแจ้งเตือนผู้ใช้เสมอหากพบ URL, ชื่อโปรเจกต์, Package หรือค่าตั้งต้นที่หลุดมาจากโปรเจกต์อื่น
- **Folder Separation:** แยก `frontend/` (โค้ด Front), `backend/` (โค้ด Back), และ `docs/` (เอกสารกลางทั้งหมด) ขาดจากกัน

---

## 3. Dependencies: Latest Stable, Only When Needed
- Before adding a package, determine whether existing dependencies or platform APIs already solve the problem. Add only actively maintained packages necessary for the feature.
- For a new dependency, verify the **latest stable, generally available (GA) release** using official documentation and the package registry (`npm view <pkg> version`) at installation time.
- **Do NOT select** alpha, beta, RC, canary, nightly, experimental, deprecated, or abandoned releases. A stable version may be below 1.0; evaluate the project's release policy rather than the version number alone.
- Check runtime compatibility, peer dependencies, license, maintenance, and known advisories. Prefer the latest stable release compatible with the project's supported environment. If incompatible, explain the constraint before selecting an older supported release; do not silently upgrade the whole project. Never invent a latest version or claim freshness without checking.
- Use the existing package manager and commit its lockfile. Keep installs reproducible.

---

## 4. Verification and Self-Correction
- Define acceptance criteria before implementation. For logic changes, write or update meaningful automated tests; use a regression test before fixing a reproducible bug when practical. Test behavior and failure modes, not implementation details alone.
- Cover relevant invalid inputs, empty data, permissions, network failure, concurrency, and business constraints. Use representative fixtures. Mock external boundaries where appropriate, but never remove the rule being tested. Do not use production personal data in tests.
- Run relevant unit/integration tests, lint, and builds using the project's supported commands. Verify UI behavior in the browser where relevant. For documentation-only changes, use appropriate content checks rather than manufacturing unit tests.
- When checks fail, read the error, identify a supported hypothesis, and fix the exact cause. Do not weaken tests or security controls to obtain green results. Distinguish pre-existing failures from failures introduced by the change. Report exact checks executed, their results, and anything not run. Never claim that passing tests prove the entire system cannot break.

---

## 5. Multi-Agent Role Boundaries & Quality Gates
| Role | หน้าที่หลัก | สิทธิ์การแก้ไฟล์ |
| :--- | :--- | :--- |
| **PM / PO** | แตก Requirement, เขียน User Stories + Acceptance Criteria (AC) | เขียนเฉพาะ `docs/agent-hub/` (ห้ามแก้โค้ด) |
| **Dev Front** | วาง UI ตาม `02-ui-spec.md` + เชื่อมต่อตาม `01-api-contract.md` | แก้เฉพาะ `frontend/` |
| **Dev Back** | สร้าง API/DB/Business Logic + Unit tests ตาม Contract | แก้เฉพาะ `backend/` |
| **QA / QC & Tester** | รัน Test จริง, ตรวจตาม AC, รีวิวโค้ดและ UI (`hallmark` / `anti-slop-craft`) | อ่านทุกไฟล์ + เขียนเทส/รายงานผลใน `docs/agent-hub/04-qa-report.md` (ไม่แอบแก้ logic เอง) |
| **Reporter** | สรุปสถานะงาน, Release notes, สิ่งที่ผ่าน/ติดปัญหา ให้คนอ่านจบในหน้าเดียว | อ่านอย่างเดียว + สรุปผล / `docs/handover.md` |

### Quality Gates (ห้ามไหลข้ามเฟสโดยไม่มีจุดตรวจ)
- **Gate 1 (ก่อน Dev เริ่ม):** ต้องมี AC (`00-brief.md`) + API Contract (`01-api-contract.md`) + UI Spec (`02-ui-spec.md`) + Security Baseline (`03-security-baseline.md`) ใน `docs/agent-hub/` และได้รับการอนุมัติแล้ว
- **Gate 2 (ก่อนส่งให้ QA):** Dev ต้องรัน `lint` / `build` / `test` ผ่านครบก่อน พร้อมอัปเดต `docs/agent-hub/99-status-log.md`
- **Gate 3 (ก่อนปล่อยงาน):** QA/Tester ต้องตรวจผ่านครบทั้ง Functional (AC), Edge states, Security/RBAC และ Anti-slop review

---

## 6. Collaboration and Git Discipline
- Assume another engineer or AI may join at any moment. Inspect uncommitted changes before editing. Never overwrite, revert, stage, or commit someone else's work without authorization. Respect file ownership and task boundaries, keep interfaces explicit, and coordinate overlapping edits before proceeding.
- When parallel work is authorized (e.g., `/teamwork`), divide work by coherent ownership, communicate API/schema contracts, and avoid simultaneous edits to shared files or dependency manifests. Do not start additional agents merely for small fixes.
- Make small, coherent local commits after verified milestones, including relevant tests, lockfiles, and handover updates.
- **MANDATORY POLICY:** นอกจาก `docs/handover.md` และ `docs/note.md` แล้ว ต้องทำ `git commit` และ `git push origin main` ขึ้น GitHub (`https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git`) ทุกครั้งหลังจบแต่ละ Phase/Milestone ห้ามละเลยเด็ดขาด *(ห้าม push ไปยัง URL โปรเจกต์อื่นเด็ดขาด)*
- Inspect the staged diff and check for secrets before committing. Stage specific files or hunks; avoid indiscriminate staging. Do not amend another contributor's commits, force-push, reset destructively, push without verification, merge, or deploy without authorization.
- If Git remote is missing/unconfirmed, report explicitly and leave a verified local commit checkpoint.

---

## 7. Continuous Handover and Important Notes
Maintain `docs/handover.md` (and `docs/note.md` for decisions/scratchpad). Read at task start and update after meaningful milestones, scope changes, major findings, and before stopping. Keep it concise, current, and sufficient for another collaborator to resume without conversation history. Include:
- Current objective, scope, acceptance criteria, and completion status.
- Key files, architecture boundaries, API/data contracts, and important business rules.
- Decisions and their rationale; confirmed facts versus unresolved assumptions.
- Verification commands, results, and checks not run.
- Security findings, release blockers, known limitations, and concrete next actions.
- Environment variable names and setup steps, **never secret values**.
- Collaboration ownership, integration dependencies, and relevant commit references (never guess a commit hash).

---

## 8. Completion Report
Explain in plain language:
1. What changed and why.
2. How it was checked: actual test/build/UI/security results and limitations.
3. Remaining blockers or follow-up actions, if any.
4. Commit reference and handover location, when available.

Finish only when authorized scope and acceptance criteria are satisfied, or a concrete external blocker prevents further progress. Do not label incomplete, unsafe, or unverified work as production-ready.

---

## Standing Auto-Gates (Execute Automatically Without User Prompting)

### 1. Automatic Enterprise Copy Hygiene Gate (Before Every UI Commit)
Whenever adding or editing ANY user-facing text in `frontend/src/i18n/translations.js`, `constants/`, `components/`, or `pages/`, you MUST automatically screen your new/edited strings against these rules **before** committing:
- **Zero informal slang / conversational filler:** No `Ping-Pong`/`ปิงปอง`, `Nudge`, `Hit Date`, `ปรับจูน`, `นัดคุย`, `โพสต์`, `ได้เลย`, `อีกเล็กน้อย`, `ครับ`/`ค่ะ`, or `!` in system UI copy.
- **Zero over-explained rationale leaks or redundant English parens in Thai UI:** Never put UX rationale (`No Mental Math`, `1-Click Add`, `HR Governance`, `Next Batch`) or redundant English words in parentheses next to clear Thai labels (e.g., use `เชิญพนักงานใหม่` instead of `เพิ่มพนักงานใหม่ (Invite)`).
- **Zero Developer/Demo hints in production auth/error copy:** Never tell users to "open EMP-0001" inside auth/validation error messages.
- **Consistent Thai Enterprise vocabulary:** Use `รายการ` instead of casual `เคส` in formal UI labels.

### 2. Automatic Handover, Status Log & Git Sync Gate (After Every Completed Change)
Whenever a code or documentation change is completed and verified (`lint` + `build` and/or `test` PASS):
1. Automatically update `docs/handover.md` and `docs/agent-hub/99-status-log.md` (and `docs/note.md` if product decisions/PO evidence changed).
2. Automatically stage, `git commit` with a clear conventional message, and `git push origin main`.
3. End the reply with a 1-line **Auto-Sync Status** checklist (`Copy Gate ✅ | handover.md ✅ | status-log ✅ | git push ✅`) so the user never has to ask whether everything was synced.
