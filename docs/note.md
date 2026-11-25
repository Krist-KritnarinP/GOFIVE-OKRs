# Project Notes & Part 2 Answer Scratchpad

> **Purpose:** Central non-code notebook for product decisions, research evidence, open reminders, and concrete real-world examples for the **Gofive PO Exam (Part 2)** questions.

**Repository:** `https://github.com/Krist-KritnarinP/GOFIVE-OKRs.git`  
**Last Updated:** 2026-11-25

---

## 1. Key Product Decisions Log (Chronological)
1. **Aesthetic & Guardrails:** Locked to **"Nordic Slate & Electric Cobalt"** (`#F6F7F9` canvas, `#FFFFFF` opaque surfaces, `#0F172A` text, `#0052FF` Electric Cobalt primary CTA max 5% viewport), strict WCAG 2.1 AA contrast, zero glassmorphism, `0ms` instant UI, zero heavy UI/chart libraries (`motion` & `recharts` uninstalled), and text-only `empeo` wordmark.
2. **Pure JavaScript Only:** Strictly `.js` and `.jsx` across `frontend/` and `backend/` (no TypeScript). Prisma pinned to `6.19.3` (GA Pure-JS + Supabase Dual-URL).
3. **Simulated 1-Office-Unit Demo (16 Users) + Clean Login:**
   - Removed Quick-Fill Demo panel from Login for a clean single-card layout + gold **`คลิกเพื่อจำลองdemo`** bypass button → 2-level drill-down picker (`Role Group` → `Specific Person`).
   - Exact 16-user roster: 1 Super Admin (`EMP-0001`), 2 HR Admins (`EMP-1001`–`1002`), 3 Managers (`EMP-2001`–`2003`), 6 Active Employees (`EMP-3001`–`3006`), 4 Pending New Employees (`EMP-3091`–`3094`).
4. **Job Leveling + OKR Focus + Manager Co-Edit (Research-Backed):**
   - Grounded in *Scullen, Mount, & Goff (2000), Journal of Applied Psychology*: Idiosyncratic Rater Effect (IRE) accounts for **53%–62%** of rating variance vs **21%–25%** actual performance.
   - Solution: Show **Job Level (`L1 Junior` / `L2 Mid` / `L3 Senior` / `L4 Lead`)** everywhere so task difficulty is anchored to role scope; allow Manager to **co-edit `Weight %` (total = 100%) and `Multiplier (1.0x/1.1x/1.2x)`** directly during OKR Approval with transparent before→after diff logging.
5. **3-Stage Due Dates + HRBP Advisor / Facilitator Window:**
   - Stage 1 (Days 1–10): Employee OKR Draft & Submit.
   - Stage 2 (Days 11–15): Manager Review / Ping-Pong (5-day SLA).
   - Stage 3 (Days 16–20): HRBP Audit & Publish Window (HR Fixed date) with dynamic timing chips (`Done Xd early`, `Done on time`, `Xd left`, `Overdue Xd`).
   - When SLA breaches or Ping-Pong reaches **Round 2+**, system alerts HRBP to post an **HRBP Advisor Comment** (e.g., recommend a 15-min 1-on-1 alignment check-in) without taking approval ownership away from the Manager.
6. **Approach A (Lean v1 Publish Gate — Clean Bridge to Part 2 Q2):**
   - Removed `Lock Calibration` button from v1 → single clean **`HR Approve & Publish`** (`MANAGER_APPROVED` → `PUBLISHED`), while keeping server-side `sanitizeReviewForRole` locked until `PUBLISHED`.
7. **Role-Scoped Activity Log across ALL 4 Roles:**
   - Server-side & client-side strict `visibilityScope` isolation (`ADMIN_SECURITY`, `CYCLE_GOVERNANCE`, `HR_INTERNAL`, `TEAM_MANAGER`, `PUBLIC_SELF`) preventing bias alerts or unpublished scores from ever leaking to Employees or other Managers.
8. **Bilingual Strategy:** English (`EN`) default with 1-click toggle to natural, idiomatic Thai HR/business copy (`ไทย`), synced to `<html lang>`.

---

## 2. Part 2 — Question Scratchpad (Real Evidence Captured From This Project)
1. **Q1 (Scope & Prioritization):**
   - *v1 In-Scope:* Single active annual review cycle with 3-Stage Due Dates, Job Leveling (`L1–L4`), OKR Alignment with Manager Co-Edit (Weight=100% + Multiplier diff), 1–5 Behavioral Anchors, Evidence-required extreme ratings (`1/2/5`), Dual-Axis (What 60% + How 40%) → 9-Box Performance Grid & Org Distribution Bar, Manager Bias Alerts, HRBP Advisor Intervention on SLA breach / Ping-Pong ≥ 2, Strict 4-Role Activity Log, and `HR Approve & Publish` gate.
   - *Deliberately Left Out of v1:* Cross-team formal Calibration committee workflow (deferred to v2 — directly sets up Q2), 360° Peer Reviews, automated compensation/bonus payout calculation, full LMS/IDP course catalog.
2. **Q2 (Requirement Change — Mandatory Cross-Team Calibration Before Release):**
   - *Architectural Fit:* Because v1 deliberately kept `MANAGER_APPROVED` → `PUBLISHED` clean with a server-side `sanitizeReviewForRole` gate (`status === 'PUBLISHED'`), adding mandatory cross-team calibration requires inserting `CALIBRATION_PENDING` → `CALIBRATION_LOCKED` between `MANAGER_APPROVED` and `PUBLISHED` without changing any employee visibility lock or breaking OKR/self-review flows.
   - *Success Metrics:* Cross-team rating variance reduction, % of extreme ratings (`1/2/5`) backed by concrete evidence, calibration turnaround SLA, post-release employee fairness perception survey score.
3. **Q3 (Working with AI — Where We Disagreed, Reworked, or Threw Out AI Suggestions):**
   - *Real Example #1 (Uninstalled Heavy Libraries):* AI initially installed `motion` (Framer Motion) and `recharts`. We **rejected and uninstalled both** (-49 packages, -140 kB) to guarantee `0ms` instant UI and crisp pure HTML/Tailwind Grid rendering for the 9-Box Grid and Distribution Bar.
   - *Real Example #2 (Caught Premature Coding & Demanded Research-Backed Pushback):* When discussing OKR/KPI ping-pong and Calibration, AI jumped straight into coding without challenging risks first. We stopped, demanded Devil's Advocate analysis backed by real HR research (*Scullen et al. 2000* IRE study, Google re:Work OKR Sandbagging trap, SHRM/Culture Amp SLA & HRBP facilitation), and **threw out** the premature v1 `Lock Calibration` button (adopting lean Approach A + Job Leveling + Manager Co-Edit + 3-Stage SLA + HRBP Advisor Comment instead).
   - *Real Example #3 (Enforced Real Skill Auditing):* Caught AI skipping installed skills (`0%` usage on a sprint) and forced a full-site review using `modern-web-guidance`, `interface-design`, `ux-writing`, and `ponytail-review`, which uncovered real bugs (UTC+7 date shift, false `"Done on time"` cycle chips, missing `<dialog>` Escape/focus containment, missing backend `PUBLISHED` state guards, and raw `SCREAMING_SNAKE_CASE` enum leaks in UI badges).

---

## 3. Completed UI/UX & Zero-Learning-Curve Sprint (2026-11-25 — All 5 Items Shipped & Verified)
1. **[DONE] Activity Log Placement:** Moved `ActivityLogPanel` to the **very bottom** (full-width) of all 4 role pages (`SuperAdminPage`, `HrDashboardPage`, `ManagerWorkspacePage`, `EmployeeWorkspacePage`), freeing horizontal space for tables and exception queues.
2. **[DONE] Important Dropdowns — Category & Hierarchy Coloring (`TieredSelect.jsx`):** Added color-coded semantic left-bar + tinted styling with progressive `appearance: base-select` (`modern-web-guidance: branded-select-styling`) and clean native fallback across Role (`T1–T4`), Job Level (`L1–L4`), Difficulty Multiplier (`1.0x/1.1x/1.2x`), Measurement Mode (`Numeric / Milestone / Service Quality`), Self Score (`1–5`), and Department selects.
3. **[DONE] Return Cards, Toast & Actionable Error Audit:**
   - Added `ReturnFeedbackCard.jsx` displaying who returned the review, round number, exact quoted comment, numbered 3-step fix instructions, and HRBP Advisor guidance.
   - Upgraded `ToastBar.jsx` with persistent pre-mounted notification/live regions, native `document.ariaNotify()` when supported, hover/focus pause-on-dismiss, semantic icons, and 320px/375px safe responsive width.
   - Rewrote EN/TH validation and auth errors to name exact missing fields/OKRs and character counts (`aria-invalid="false"` / `"true"` + `:user-invalid` + focus to first invalid field).
4. **[DONE] Zero-Learning-Curve & Close Gen-Gap Upgrades:**
   - Added 1-click **Department Starter OKR Templates** (`okrTemplates.js`) across 6 universal job families (Operations/Admin/Finance, Sales & Marketing, Customer Support, HR, Product & Design, Engineering & IT).
   - Added **Quick Importance Buttons** (`50% / 30% / 20%`) + 1-click **`Auto-Balance 100%`** button in both Employee OKR Builder and Manager `GoalApprovalDrawer`.
   - Added **3 Natural Measurement Modes** (`Numeric`, `Milestone Checklist`, `Service / Quality Standard`) with contextual 1-line tips.
   - Added single plain-language **`NextActionBanner.jsx`** ("Your Turn Now" / "All Set — Waiting" / "Completed") on Employee & Manager views, **3-Question Guided Evidence Prompt Chips**, `localStorage` **Auto-Save** badge, and **Quick Preview & Confirm** dialog before OKR submission.
5. **[DONE] Live Browser QA (Desktop `1440px` + Mobile `375px`):** Verified across all 4 roles, caught & fixed missing `showToast` export in `usePerformanceStore.js`, 0 console errors, 0 horizontal overflow on `375px` mobile.
