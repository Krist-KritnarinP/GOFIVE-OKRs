# 01 — Frontend Engineering, Clean Code & UI Quality Rules (Strict Mandate)

> **Applies to:** Dev Front (`frontend/` ONLY) & QA/QC (UI/Craft Review)

---

## 1. Pure JavaScript & Clean Code Mandate (Professional Programmer Standard)
- **ห้ามใช้ TypeScript เด็ดขาด:** โค้ดทั้งหมดใน `frontend/` ต้องเป็น Pure JavaScript (`.js`, `.jsx`) เท่านั้น
- **Preserve Working Code:** Preserve established conventions and working behavior. Do not reformat, rename, delete comments, or refactor unrelated code. Make necessary structural changes within the requested feature and explain why.
- **Component Decomposition (Single Responsibility Principle):**
  - ห้ามเขียนคอมโพเนนต์ยักษ์ (Monolithic Giant Component) หรือเอาโค้ดหลายร้อยบรรทัดมากองรวมในไฟล์เดียว (เช่น กองรวมใน `App.jsx`)
  - แยกย่อยโฟลเดอร์ให้เป็นระบบ:
    - `src/components/` (สกัดชิ้นส่วน UI ที่มีหน้าที่เฉพาะตัว เช่น `Navbar`, `Footer`, `Drawer`, `Card`, `Form`)
    - `src/pages/`
    - `src/constants/`
    - `src/services/`
    - `src/hooks/`
    - `src/i18n/` (สำหรับโปรเจกต์หลายภาษา)
- **Readability & Self-Documenting Code:**
  - ใช้ชื่อตัวแปร ฟังก์ชัน และคอมโพเนนต์ที่สื่อความหมายชัดเจน ตรงไปตรงมา (Descriptive & Meaningful naming)
  - ฟังก์ชันต้องมีขนาดเล็ก ทำงานเพียงหน้าที่เดียว (Small, Focused Functions)
  - หลีกเลี่ยงโค้ดซ้ำซ้อน (DRY) ดึงค่าคงที่ (Constants) หรือข้อมูล Mock ออกมาเก็บเป็นไฟล์แยก
- **Continuous Refactoring:**
  - เมื่อพัฒนาฟีเจอร์เสร็จ ต้องตรวจสอบและ Refactor โค้ดให้กระชับ สะอาด เป็นระเบียบเรียบร้อย ก่อนส่งมอบงานเสมอ
  - หลีกเลี่ยง Circular Dependencies, Excessive Prop Drilling, และ Unnecessary Wrappers
  - ลบโค้ดที่ไม่ใช้งาน (Dead code) และห้ามทิ้ง Placeholder หรือ TODO ค้างไว้ใน Required functionality

---

## 2. UI Quality & Anti-Slop Mandate
Start from the user's audience, task, content, brand, and references. Establish a coherent visual direction before substantial UI work: typography, spacing, color, layout, density, interaction, and responsive behavior.

### Client Mandate on UI Layout & Accessibility
- **Full Screen UI:** ออกแบบและจัดวาง UI แบบเต็มหน้าจอ 100% Edge-to-Edge ไม่เหลือขอบว่างซ้าย-ขวา ใช้พื้นที่ได้อย่างเต็มประสิทธิภาพ
- **Universal Responsiveness:** รองรับ Responsive อย่างสมบูรณ์แบบ ทั้ง Smartphone (มือถือทุกขนาด), iPad / Tablet (ทั้งแนวตั้งและแนวนอน), และ Desktop (ห้ามมี horizontal overflow)
- **Typography & Readability:** ขนาดตัวอักษรต้องอ่านง่าย ชัดเจน สบายตา เหมาะสำหรับผู้ใช้งานทุกเพศและทุกวัย (All genders, All age groups รวมถึงกลุ่มผู้สูงอายุ) โดยคำนึงถึง Contrast (`>= 4.5:1` สำหรับข้อความปกติ, `>= 3.0:1` สำหรับหัวข้อใหญ่/ไอคอน/ขอบ) และ Hierarchy
- **Avoid Generic AI Output:** Do not default to purple gradients, excessive glass effects, oversized hero sections, uniform card grids, decorative icons, generic illustrations, or filler copy. Every visual choice must support hierarchy, comprehension, or the intended brand.
- **Complete Interactive States:** Design with realistic content, clear primary actions, and deliberate spacing. Include **loading, empty, error, success, disabled, validation, and permission states** where relevant. Preserve user input after recoverable failures.
- **Accessibility & Visual Verification:** Use semantic HTML, accessible labels, keyboard operation, visible focus, sufficient contrast, reduced-motion support, and touch-friendly controls (`>= 44px`). Inspect actual rendered screens at relevant desktop and mobile sizes. Report if browser/visual verification could not be performed; never imply it happened.

---

## 3. Frontend Tech Stack Baseline
- **Port (Local):** `5173`
- **Core Packages (verify latest stable via `npm view` before install):**
  - Dependencies: `react` (19.x), `react-dom` (19.x), `react-router-dom` (7.x), `lucide-react`, `axios`
  - DevDependencies: `vite` (8.x), `@vitejs/plugin-react`, `tailwindcss` (4.x), `@tailwindcss/vite` (4.x), `oxlint`
- **UI Library Choice (decide per project in Step 1–2):**
  - **Custom Tailwind v4 Craft (Recommended for Enterprise/Fast UI):** Semantic CSS variables in `src/index.css`, opaque floating layers, lightweight HTML/Tailwind Grid/SVG, `150ms` CSS transitions (zero heavy animation/charting libs).
  - **Optional DaisyUI 5 (if chosen for rapid forms):**
    - *กฎเทคนิคสำคัญ:* Override คลาสของ DaisyUI v5 (`.badge`, `.btn`, `.tab`, `.input`, `.select`) ใน `src/index.css` ต้องวางใน `@layer utilities { @layer daisyui { ... } }` เพื่อให้ไม่ชนกับ Tailwind utility
- **Brand CI & Design System (Locked for empeo / GOFIVE TEST):**
  - **"Nordic Slate & Electric Cobalt"** (`#F6F7F9` canvas, `#FFFFFF` opaque surface, `#0F172A` primary text, `#475569` secondary, `#64748B` muted, `#0052FF` Electric Cobalt primary CTA max 5% viewport, `#6366F1` Indigo secondary data accent, 4 locked semantic status pairs) — see `docs/agent-hub/02-ui-spec.md`.
  - **Opaque Floating Layers Only (Zero Glassmorphism):** Never use `backdrop-blur` or translucent floating panels.
  - **0ms Instant UI & Zero Heavy Libraries:** Never install `motion`/Framer Motion, `recharts`, `chart.js`, or `apexcharts`. Build 9-Box Performance Grid & Org Distribution Bar with pure HTML, Tailwind Grid, inline SVG, and `150ms` CSS transitions. Apply `tabular-nums` to all numeric columns.
