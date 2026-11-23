# 02 — UI/UX, Color System & Strict Accessibility Specification

**Aesthetic Direction:** **Nordic Slate & Electric Cobalt** *(Linear / Stripe / Swiss Grid Enterprise UI — crisp 1px hairlines, high contrast, generous whitespace, zero AI slop, zero glassmorphism)*  
**Stack:** React 19 (Pure JS `.jsx`), Vite 8, Tailwind CSS 4, `lucide-react` (sparingly), Pure Semantic HTML + Tailwind CSS Grid + Lightweight Inline SVG  
**Banned Heavy UI Libraries:** Do **NOT** install `motion` / Framer Motion, `recharts`, `chart.js`, or `apexcharts`.

---

## 1. Locked Color System ("Nordic Slate & Electric Cobalt")
All tokens live in `frontend/src/index.css`:

| Category | Token / Role | Hex / Value | Contrast / Usage Rule |
| :--- | :--- | :--- | :--- |
| **Canvas & Surfaces** | App Background (Cool Alabaster) | `#F6F7F9` | Page canvas |
| | Card / Table / Drawer Surface | `#FFFFFF` | Pure White, opaque only |
| | Subtle Header / Alternating Row | `#F0F2F5` | Soft Slate |
| | Hairline Border | `#E2E5EB` | `1px solid` default border |
| | Elevated Layer Border | `#CBD5E1` | `1px solid` for drawers, modals, secondary buttons |
| **Typography** | Primary Text (Deep Obsidian) | `#0F172A` | 17.5:1 on `#FFFFFF` (headings, names, metrics) |
| | Secondary Text (Slate Gray) | `#475569` | 7.0:1 on `#FFFFFF` (roles, descriptions) |
| | Muted Text | `#64748B` | 4.7:1 on `#FFFFFF` (timestamps, captions — never lighter!) |
| **Brand & Accents** | Primary Brand CTA (Electric Cobalt) | `#0052FF` | Max 5% of viewport; 1 Primary CTA per section |
| *(Max 5% viewport)* | Primary Brand Hover | `#003ECC` | Hover state for primary CTA |
| | Secondary Data Accent (Crisp Indigo) | `#6366F1` | Strictly for comparative chart bars |
| **Status: High / Exceeds** | Bg / Text / Border | `#ECFDF5` / `#065F46` / `#A7F3D0` | 7.4:1 contrast |
| **Status: On Track / Meets** | Bg / Text / Border | `#F0F9FF` / `#0369A1` / `#BAE6FD` | 6.8:1 contrast |
| **Status: Overdue / Warning** | Bg / Text / Border | `#FFFBEB` / `#92400E` / `#FDE68A` | 7.1:1 contrast |
| **Status: Low / Needs Action** | Bg / Text / Border | `#FEF2F2` / `#991B1B` / `#FECACA` | 7.3:1 contrast |

---

## 2. Strict Accessibility & Contrast Guardrails (WCAG 2.1 AA / APCA)
1. **Mandatory Minimum Contrast:**
   - Body text, table cells, labels, and placeholders MUST maintain **>= 4.5:1** contrast. Never use `#94A3B8` or lighter for readable text/placeholders on `#FFFFFF`.
   - Large headings (`>= 18px` bold) and UI borders/icons MUST maintain **>= 3.0:1** contrast.
2. **Opaque Floating Layers Only (Zero Glassmorphism):**
   - Never use translucent or blurred (`backdrop-blur`) backgrounds on headers, modals, drawers, dropdowns, tooltips, or toasts.
   - **Dropdowns / Popovers:** Solid `#FFFFFF` surface + `1px solid #CBD5E1` + `0 4px 12px rgba(15, 23, 42, 0.08)` + `#0F172A` text. Hover row: `#F1F5F9` bg with `#0F172A` text.
   - **Toasts & Tooltips:** Solid `#0F172A` surface + `#FFFFFF` text (17.5:1) with a `4px` left semantic accent bar (`#10B981`, `#F59E0B`, or `#EF4444`).
   - **Modals & Slide-over Drawers:** Opaque darkened backdrop (`rgba(15, 23, 42, 0.55)`) + crisp `#FFFFFF` surface + `#0F172A` text.
3. **Disabled States:** `#F1F5F9` bg, `#E2E5EB` border, `#64748B` text. Never lower `opacity` below `0.6`.
4. **Full Screen & Universal Responsiveness:**
   - 100% Edge-to-Edge layout (`w-full min-h-screen`), zero horizontal overflow on Mobile (`375px`), Tablet/iPad (`768px`–`1024px`), and Desktop (`1280px+`).
   - Base font `16px`, touch targets `min-h-11` (`44px`), readable for all genders and age groups.

---

## 3. Speed, Zero-Latency & Radical Minimalism Rules
1. **0ms Instant UI (No Fake Spinners):** Never use `setTimeout`, fake skeleton loaders, or artificial delays. Role switches, filters, score adjustments, nudges, and cycle toggles update React state instantaneously (`0ms`) with crisp `150ms` CSS-only transitions (`transition-colors duration-150 ease-out`).
2. **Zero Heavy Libraries:** Build **9-Box Performance Grid**, **Org Distribution Bar**, and score meters using pure semantic HTML, Tailwind CSS Grid, and lightweight inline SVG.
3. **Radical Simplicity & Progressive Disclosure:**
   - 1 Primary CTA (`#0052FF`) per viewport section; secondary actions use `#FFFFFF` bg + `1px solid #CBD5E1` + `#0F172A` text.
   - Tight border radius (`rounded-md` / `6px` or `rounded-lg` / `8px`) + `1px solid #E2E5EB` borders (no heavy drop shadows).
   - Tables stay scannable (max 5–6 columns). Detailed rubric scoring, KPI breakdowns, and bias alerts live inside a **Slide-over Drawer** on row click.
   - Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to every score, percentage, and count.
4. **Static Shell (`CLS = 0`):** Persistent top navigation bar (`empeo` logo, Active Review Cycle badge, 1-click **Role Switcher** `HR Admin | Manager | Employee`, and **EN / ไทย** toggle) stays fixed while inner role views swap seamlessly.

---

## 4. Core Views & Natural Bilingual Copy (EN Default + Idiomatic TH)
- **HR Admin:** Cycle setup (What/How weights, rubric anchors, deadline, Grace Period / Lock Cycle toggle), Org-wide **9-Box Performance Grid** + **Org Distribution Bar** + **Bias Alerts**, Overdue Exception Queue (`Send Nudge` / `Extend Grace Period` / `Escalate`), Publish Results gate, and Audit Log.
- **Manager:** Scannable team table (max 5–6 columns) with overdue badges; clicking a row opens the **Slide-over Drawer** showing Employee Goals/KPIs & Self-Review alongside 1–5 Behavioral Anchor Rubric scoring, Evidence guardrail (`1`, `2`, `5`), and live Team Bias/Distribution indicator.
- **Employee:** Own OKRs/KPIs with progress bars, Self-Reflection & Evidence submission, lifecycle stepper, and locked vs. published final review breakdown.
- **Thai Copy Standard:** Natural HR/business Thai (never literal Google Translate):
  - `Performance Management` → `บริหารผลการปฏิบัติงาน`
  - `High Performer` → `พนักงานผลงานโดดเด่น`
  - `Needs Action` → `ต้องดูแลและพัฒนาเร่งด่วน`
  - `Send Nudge` → `ส่งแจ้งเตือนติดตาม`
  - `Grace Period` → `ช่วงผ่อนผันส่งประเมิน`
  - `Lock Cycle` → `ปิดรอบการประเมิน`
