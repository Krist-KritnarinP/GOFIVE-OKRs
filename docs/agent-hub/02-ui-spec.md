# 02 — UI/UX & Responsive Specification

**Stack:** React 19 (Pure JS `.jsx`), Vite 8, Tailwind CSS 4, `motion`, `recharts`, `lucide-react`  
**Brand CI Status:** Pending final palette in next session — all colors MUST reference semantic CSS variables in `frontend/src/index.css` (`--surface-*`, `--ink-*`, `--accent-*`, `--status-*`) so Brand CI can be swapped in 1 file without touching components.

---

## 1. Layout, Accessibility & Typography Mandates
- **Full Screen 100% Edge-to-Edge:** Application shell uses `min-h-screen w-full` with a collapsible sidebar on desktop (`>= 1024px`) and responsive top bar + drawer on tablet/mobile. No cramped fixed-width centered box leaving empty side margins.
- **Universal Responsiveness:**
  - **Desktop (`>= 1280px`):** Persistent left navigation rail (`248px`) + full-width fluid workspace grid.
  - **Tablet / iPad (`768px`–`1279px`):** Collapsible navigation drawer + 2-column adaptive cards/split views.
  - **Mobile (`< 768px`):** Sticky header with Role Switcher + EN/TH toggle + single-column touch-friendly stacked layout (`min-h-11` / `44px` tap targets).
- **Typography for All Ages & Genders:**
  - Base body text `16px` (`1rem`), relaxed line-height (`1.55`), never smaller than `13px` even for helper/metadata labels.
  - Clear font pairing supporting both Latin & Thai cleanly (e.g., `Plus Jakarta Sans` / `Inter` + `Noto Sans Thai` fallback to system UI sans).
  - Minimum WCAG AA contrast (`>= 4.5:1` for body text, `>= 3:1` for interactive borders/icons).
  - Support `prefers-reduced-motion` on all `motion` transitions.

---

## 2. Global App Shell & Navigation
- **Top Utility Bar (Always visible):**
  - Left: Mobile menu button + Product wordmark (`empeo` + `Performance` pill) + Active Cycle badge (`FY 2026 Annual Review`).
  - Right:
    1. **Demo Persona / Role Switcher** (1-click switch between `HR Admin`, `Manager — Sarah (Engineering)`, `Manager — Somchai (Sales, Overdue + Bias Alert)`, `Employee — Nida (Ready/Published)`, `Employee — Ton (Draft Self-Review)`).
    2. **Language Toggle (`EN` / `ไทย`)** — switches entire UI immediately with natural, idiomatic Thai HR phrasing.
- **Left Navigation Rail (Role-scoped):**
  - `HR_ADMIN`: Overview & Fairness, Talent Matrix, Exceptions & Overdue, Cycle & Rubric, Audit Log.
  - `MANAGER`: My Team Reviews, Team Distribution Preview, My Own Review.
  - `EMPLOYEE`: My Goals & Self-Review, My Results.

---

## 3. Core Views & Key Interactions

### View 1: HR Admin — Fairness & Oversight Console
1. **KPI Strip (4 scannable cards):** Completion Rate (%), Overdue Reviews (highlighted with quick jump), Org Average Score, Active Bias Alerts.
2. **Dual-Axis Talent Matrix (Interactive Scatter/Quadrant Chart via `recharts`):**
   - X-axis: Goal Achievement (`What`, 1.0–5.0)
   - Y-axis: Core Competencies (`How`, 1.0–5.0)
   - 4 clear quadrants: **High Performer**, **High Potential**, **Solid Contributor**, **At-Risk / Low Performer**
   - Clicking any employee dot opens a slide-over detail drawer showing their goals, evidence, and scores.
3. **Score Distribution & Manager Bias Alerts:**
   - Bar chart comparing org-wide score spread (`1`–`5`) with a clear alert list flagging managers with Leniency Bias / Severity Bias / Uniform Rating (e.g., *"Somchai rated 80% of Sales team at 5.0 vs. 3.6 org avg"*).
4. **Exception Queue (Missed Deadlines):**
   - Dedicated panel listing overdue employees/managers with `Days Overdue` pill and inline action buttons: **Send Nudge**, **Extend Deadline**, **Escalate**.
   - Each action opens a clean modal (requiring a short reason for Extend/Escalate), updates status optimistically/via API, and appends to the **Audit Log** tab.
5. **Publish Results Control:**
   - Clear banner showing how many reviews are `READY_FOR_RELEASE` vs. `PUBLISHED`, with a confirmation modal before publishing results to employees.

### View 2: Manager — Evidence-First Evaluation Workspace
1. **Team Roster Table/Cards:** Shows each direct report, Goals count, Self-Review status, Deadline / Overdue badge, and primary CTA (`Evaluate` / `Continue Draft` / `View Submitted`).
2. **Side-by-Side Evaluation Workbench:**
   - **Left Column:** Employee's Goals/KPIs (with weight & progress bar) + Employee's submitted Self-Review & Self-Evidence.
   - **Right Column:** Interactive 1–5 Rating Selector with **Inline Behavioral Anchor Card** (shows exact org-wide definition for the hovered/selected score).
   - **Evidence Guardrail:** Selecting `1`, `2`, or `5` smoothly expands a required **"Supporting Evidence"** textarea with live character counter (`min 20 chars`) and clear explanation (*"Extreme ratings require concrete examples to keep reviews fair across teams"*).
3. **Team Distribution Check:** Compact live chart comparing this manager's current team scores against the org average before clicking **Submit Evaluation**.

### View 3: Employee — Goals, Self-Review & Result Transparency
1. **Review Progress Stepper:** Visual 4-step lifecycle bar (`Goals Set` → `Self-Review` → `Manager Review` → `Results Published`).
2. **My Goals & Self-Review:** Clean cards showing each KPI, weight, progress %, and self-assessment score + evidence input (`Save Draft` / `Submit Self-Review`).
3. **Results Panel (Two Distinct States):**
   - **Locked State (Before Publish):** Calm, transparent card explaining *"Your manager's evaluation is complete / in progress. Results will be visible once HR publishes the cycle."* (Zero leaked numbers.)
   - **Published State (After HR Publish):** Clear Dual-Axis Outcome card (What score, How score, Overall weighted score, Performance Tier badge), goal-by-goal feedback with evidence, and **Next-Step Development Focus**.

---

## 4. Required UI States Checklist (All Views)
- **Loading:** Skeleton blocks matching layout geometry (no jarring layout shift).
- **Empty:** Helpful empty state with next action (e.g., *"No overdue reviews — every team is on track"*).
- **Error:** Recoverable inline alert preserving user's unsaved form input + Retry action.
- **Validation:** Field-level inline error messages (especially Evidence requirement for scores `1`, `2`, `5`).
- **Permission / Locked:** Clear explanation when a view or result is locked by role or cycle state.
- **Success:** Subtle toast confirmation after Save, Submit, Nudge, Extend, Escalate, or Publish.

---

## 5. Natural Bilingual Copy Guide (EN → TH Examples)
Thai copy must read like a real Thai HR SaaS product — never robotic Google Translate:
- `Performance Management` → `บริหารผลการปฏิบัติงาน`
- `High Performer` → `พนักงานผลงานโดดเด่น`
- `At-Risk / Needs Support` → `ต้องดูแลและพัฒนาเร่งด่วน`
- `Evidence Required` → `กรุณาระบุหลักฐานผลงานประกอบ`
- `Leniency Bias Alert` → `แจ้งเตือนแนวโน้มให้คะแนนสูงเกินเกณฑ์`
- `Send Nudge` → `ส่งแจ้งเตือนติดตาม`
- `Extend Grace Period` → `ขยายเวลาส่งประเมิน`
- `Escalate to Skip-Level` → `ส่งเรื่องต่อผู้บริหารระดับถัดไป`
- `Pending HR Release` → `รอฝ่ายบุคคลประกาศผล`
