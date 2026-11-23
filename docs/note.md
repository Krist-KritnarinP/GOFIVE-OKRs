# Project Notes & Part 2 Answer Scratchpad

> **Purpose:** Central non-code notebook for product decisions, open reminders, and concrete examples for the **Gofive PO Exam (Part 2)** questions.

---

## 1. Key Product Decisions Log
- **Aesthetic & Guardrails:** Locked to **"Nordic Slate & Electric Cobalt"** (`#F6F7F9` canvas, `#FFFFFF` opaque surfaces, `#0F172A` text, `#0052FF` Electric Cobalt primary CTA max 5% viewport), strict WCAG 2.1 AA contrast, zero glassmorphism, `0ms` instant UI, and zero heavy UI/chart libraries.
- **Pure JavaScript Only:** Strictly `.js` and `.jsx` across `frontend/` and `backend/` (no TypeScript).
- **Bilingual Strategy:** English (`EN`) default with 1-click toggle to natural, idiomatic Thai HR/business copy (`ไทย`).

---

## 2. Part 2 — Question Scratchpad (To Finalize After Part 1)
1. **Q1 (Scope & Prioritization):**
   - *v1 In-Scope:* Single active annual review cycle, 1–5 Behavioral Anchors, Evidence-required extreme ratings (`1/2/5`), Dual-Axis (What + How) → 9-Box Performance Grid & Org Distribution Bar, Manager Bias Alerts, Multi-Role (`HR Admin | Manager | Employee`), Overdue Exception Handling (`Nudge / Grace Period / Lock Cycle / Escalate`).
   - *Deliberately Left Out:* 360° Peer Reviews, automated compensation/bonus linkage, full LMS/IDP course management, multi-team live calibration room.
2. **Q2 (Requirement Change — Mandatory Calibration Before Release):**
   - *Architectural Fit:* Insert `CALIBRATION_PENDING` → `CALIBRATION_LOCKED` between `READY_FOR_RELEASE` and `PUBLISHED` in the Review Lifecycle State Machine; keep server-side `sanitizeReviewForRole` gate (`status === 'PUBLISHED'`) unchanged.
   - *Success Metrics:* Cross-team rating variance reduction, % of extreme ratings backed by concrete evidence, calibration cycle time, post-release employee fairness survey score.
3. **Q3 (Working with AI — Disagreed / Reworked / Threw Out):**
   - *Real Example #1 (Captured during Phase 0):* AI initially recommended installing `motion` (Framer Motion) and `recharts` for animations and charts. We **rejected and uninstalled both** (removing 49 packages and shrinking bundle by ~140 kB) to enforce `0ms` instant UI, zero-latency interactions, and razor-sharp pure HTML/Tailwind Grid/inline SVG rendering for the 9-Box Grid and Distribution Bar.
   - *(Add any additional design/code pushbacks during Phase 2 here!)*
