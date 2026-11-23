# 00 — Product Brief, Scope & Acceptance Criteria

**Project:** empeo Performance Management Prototype (`GOFIVE TEST`)  
**Product Concept:** *Evidence-First & Dual-Axis Performance Review System*  
**Status:** Ready for Gate 1 Review  

---

## 1. Core Problem & Challenge
Many organizations still run annual performance reviews on spreadsheets and email, causing:
- Late manager evaluations with no structured tracking or escalation
- Employees unable to see their own goals or criteria clearly
- HR unable to consolidate organization-wide results
- Inconsistent rating scales across managers (lenient vs. strict bias)

**Central Question to Solve:**
> *How do we make annual performance reviews **fair** across an entire organization, and genuinely surface who the **high performers** and **low performers** are?*

---

## 2. Core Product Pillars (v1 Solution)
1. **Behavioral Anchors (Shared Standard Rubric):** Every rating level (1–5) displays the same organization-wide behavioral definition directly beside the score control so managers evaluate against shared criteria, not gut feeling.
2. **Evidence-Required Rating (No Floating Scores):** Ratings at extremes (`1`, `2`, or `5`) require written evidence linked to actual deliverables or goal progress before submission is allowed.
3. **Dual-Axis Performance Model (What + How):**
   - **Axis 1 — Goal Achievement (What, e.g., 60%):** Concrete KPI/OKR attainment.
   - **Axis 2 — Core Competencies (How, e.g., 40%):** Collaboration, ownership, problem-solving, reliability.
   - Combined into a **9-Box Performance Grid** & **Org Distribution Bar** (surfacing High Performers, Solid Contributors, High Potential, and Low Performers / Needs Action) plus a **Manager Bias & Distribution Guardrail** for HR and Managers.
4. **Role-Based Experience in One System:** Distinct workspaces and server-enforced permissions for **HR Admin**, **Manager**, and **Employee**, plus a persistent 1-click **Role Switcher** (`HR Admin | Manager | Employee`) in the static top bar sharing live synchronized state.
5. **Exception Handling (When Things Don't Go to Plan):** Realistic handling of overdue self-reviews and overdue manager evaluations via **Send Nudge**, **Extend Grace Period / Lock Cycle toggle**, and **Escalate to Skip-Level Manager**, all recorded in an Audit Trail.
6. **Bilingual Support (EN Default + Natural TH):** English by default with a 1-click toggle to natural, idiomatic Thai HR/business copy.

---

## 3. Scope Discipline (v1 In-Scope vs. Deliberately Left Out)

### In-Scope (v1)
- Single active annual review cycle (e.g., `FY 2026 Annual Performance Review`) with configurable What/How weights and shared 1–5 behavioral rubric.
- Review Lifecycle State Machine:
  `DRAFT` → `SELF_REVIEW_SUBMITTED` → `MANAGER_REVIEW_SUBMITTED` → `READY_FOR_RELEASE` → `PUBLISHED`
- **HR Admin View:** Cycle overview KPIs, Completion Tracker by team, Score Distribution chart, Talent Matrix (What vs. How), Manager Bias Alerts, Exception Queue (Overdue cases with Nudge / Extend Deadline / Escalate actions), and Publish Results toggle/gate.
- **Manager View:** Direct reports list with status/overdue indicators, Side-by-Side evaluation workspace (Employee Self-Review & Goals on left, Manager Rubric Scoring & Evidence input on right), and Team Score Distribution preview vs. org benchmark before submit.
- **Employee View:** Clear Goal/KPI cards with progress, Self-Assessment form with evidence input, real-time review status tracker, and locked result state until HR publishes (`PUBLISHED` state reveals final dual-axis result, manager feedback, and next-step development focus).
- Full server-side RBAC enforcement + Zod validation + Security headers + Audit log.

### Deliberately Left Out of v1 (and Why)
- **360° Peer & Upward Reviews:** Adds form fatigue and reviewer-selection complexity before the core manager-employee fairness baseline is established.
- **Automated Compensation / Bonus Calculation:** Directly coupling pay formulas to v1 reviews requires payroll integration and HR policy sign-off; v1 focuses on fair performance signal first.
- **Full LMS / IDP Course Assignment:** Separate HRD module; v1 captures a concise "Development Focus" note instead.
- **Multi-Team Live Calibration Room:** Intentionally deferred from v1 to ship a lean, usable replacement for spreadsheets first. *(Architectural readiness: our explicit Review Lifecycle State Machine and `PUBLISHED` visibility gate allow inserting a `CALIBRATION_PENDING` / `CALIBRATION_LOCKED` state cleanly without rewriting roles or scoring models.)*

---

## 4. User Stories & Acceptance Criteria (AC)

### Epic A: Fairness & Evidence-First Evaluation
- **AC-A1:** Every rating control (1–5) displays the organization's shared behavioral anchor description for the selected level.
- **AC-A2:** Submitting a manager review with any rating of `1`, `2`, or `5` without non-empty evidence text (minimum 20 characters) is rejected on both client and server (`400 VALIDATION_ERROR`).
- **AC-A3:** Each employee's evaluation calculates weighted **Goal Score (What)**, **Competency Score (How)**, **Overall Weighted Score**, and **Performance Quadrant** deterministically on the server.

### Epic B: HR Oversight, Bias Detection & Release Control
- **AC-B1:** HR Dashboard displays org-wide completion rate, overdue count, score distribution histogram, and Dual-Axis Talent Matrix surfacing High Performers and Low Performers clearly.
- **AC-B2:** System automatically flags managers whose team average deviates significantly from the org average (e.g., `|teamAvg - orgAvg| >= 0.7` or `>= 75%` of ratings at `5` or `<= 2`) as a **Bias Alert** for HR inspection.
- **AC-B3:** HR can publish results for completed reviews (`READY_FOR_RELEASE` → `PUBLISHED`). Prior to `PUBLISHED`, employees cannot view manager ratings or manager comments via UI or API.

### Epic C: Manager Evaluation Workspace
- **AC-C1:** Manager sees only their direct reports (enforced server-side), including each report's current lifecycle status and deadline badge.
- **AC-C2:** Manager can view the employee's goals and submitted self-review side-by-side while entering manager ratings and evidence.
- **AC-C3:** Manager sees a live preview of their team's rating distribution compared to the organization guideline before submitting.

### Epic D: Employee Transparency & Self-Review
- **AC-D1:** Employee sees their own assigned goals/KPIs with weights and progress throughout the cycle.
- **AC-D2:** Employee can save draft or submit their Self-Review with evidence; once submitted, self-review fields become read-only.
- **AC-D3:** Before HR publishes results, Employee sees a clear status tracker ("Under Manager Review" / "Pending HR Release") and **zero** manager scores. After HR publishes, Employee sees their Dual-Axis outcome, breakdown, and constructive manager feedback.

### Epic E: Exception Handling (Missed Deadlines)
- **AC-E1:** Reviews past their stage deadline are visibly flagged as `OVERDUE` with days-overdue count.
- **AC-E2:** HR can take 3 real actions on an overdue review: **Send Nudge**, **Extend Deadline (+N days)**, or **Escalate to Skip-Level Manager**.
- **AC-E3:** Every exception action updates the record state immediately and writes an immutable entry to the **Audit Log** visible to HR.

### Epic F: Bilingual UX & Accessibility
- **AC-F1:** User can switch between **EN (default)** and **TH** at any time without losing page context; Thai copy uses natural HR/business phrasing.
- **AC-F2:** All core screens render edge-to-edge cleanly on Desktop (`1440px`), Tablet (`768px`–`1024px`), and Mobile (`375px`) with zero horizontal overflow and WCAG AA text contrast.
