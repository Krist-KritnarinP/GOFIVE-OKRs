import bcrypt from 'bcryptjs';
import { computeReviewScores } from '../services/scoringService.js';

const DEMO_PASSWORD_HASH = bcrypt.hashSync('DemoPass123!', 8);

export const RUBRIC_LEVELS = [
  {
    level: 1,
    label: 'Unsatisfactory',
    labelTh: 'ต่ำกว่ามาตรฐานมาก',
    anchor: 'Consistently misses core expectations and requires immediate intervention.',
    anchorTh: 'ผลงานต่ำกว่าเป้าหมายอย่างต่อเนื่อง ต้องได้รับการดูแลและปรับปรุงเร่งด่วน',
  },
  {
    level: 2,
    label: 'Needs Improvement',
    labelTh: 'ต้องพัฒนาเพิ่มเติม',
    anchor: 'Delivers inconsistently; misses key deadlines or quality standards.',
    anchorTh: 'ส่งมอบงานไม่สม่ำเสมอ พลาดกำหนดส่งหรือมาตรฐานคุณภาพสำคัญบางส่วน',
  },
  {
    level: 3,
    label: 'Meets Expectations',
    labelTh: 'ได้ตามมาตรฐาน',
    anchor: 'Reliably delivers goals on time with solid quality and teamwork.',
    anchorTh: 'ส่งมอบงานตามเป้าหมายได้สม่ำเสมอ มีคุณภาพและทำงานร่วมกับทีมได้ดี',
  },
  {
    level: 4,
    label: 'Exceeds Expectations',
    labelTh: 'สูงกว่ามาตรฐาน',
    anchor: 'Frequently outperforms targets and raises the bar for teammates.',
    anchorTh: 'ทำผลงานได้เหนือเป้าหมายอย่างสม่ำเสมอ และช่วยยกระดับมาตรฐานให้ทีม',
  },
  {
    level: 5,
    label: 'Role Model / Exceptional',
    labelTh: 'โดดเด่นเป็นแบบอย่าง',
    anchor: 'Delivers transformational business impact and elevates the entire organization.',
    anchorTh: 'สร้างผลลัพธ์ระดับเปลี่ยนแปลงให้ธุรกิจ และเป็นแบบอย่างที่ยกระดับทั้งองค์กร',
  },
];

export const COMPETENCIES = [
  { id: 'comp-ownership', name: 'Ownership & Reliability', nameTh: 'ความรับผิดชอบและความน่าเชื่อถือ' },
  { id: 'comp-collab', name: 'Cross-Team Collaboration', nameTh: 'การทำงานร่วมกันข้ามทีม' },
  { id: 'comp-problem', name: 'Problem Solving & Craft', nameTh: 'การแก้ปัญหาและคุณภาพงาน' },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    'rbac:manage': true,
    'cycle:configure': true,
    'analytics:view_org': true,
    'exception:manage': true,
    'review:publish': true,
    'team:evaluate': true,
    'self:submit': true,
    'audit:view': true,
  },
  HR_ADMIN: {
    'rbac:manage': false,
    'cycle:configure': true,
    'analytics:view_org': true,
    'exception:manage': true,
    'review:publish': true,
    'team:evaluate': true,
    'self:submit': true,
    'audit:view': true,
  },
  MANAGER: {
    'rbac:manage': false,
    'cycle:configure': false,
    'analytics:view_org': false,
    'exception:manage': false,
    'review:publish': false,
    'team:evaluate': true,
    'self:submit': true,
    'audit:view': false,
  },
  EMPLOYEE: {
    'rbac:manage': false,
    'cycle:configure': false,
    'analytics:view_org': false,
    'exception:manage': false,
    'review:publish': false,
    'team:evaluate': false,
    'self:submit': true,
    'audit:view': false,
  },
};

/**
 * 1-Office-Unit Demo Dataset (16 users total) with Job Leveling & 3-Stage Due Dates:
 * - 1 Super Admin (EMP-0001)
 * - 2 HR Admins (EMP-1001, EMP-1002)
 * - 3 Managers (EMP-2001..2003)
 * - 6 Active Employees (EMP-3001..3006)
 * - 4 New Employees Pending Super Admin Approval (EMP-3091..3094)
 */
export function createInitialSeed() {
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysFromNow = (d) => new Date(now.getTime() + d * 86400000).toISOString();

  const cycle = {
    id: 'cycle-fy2026',
    name: 'FY 2026 Annual Performance Review',
    nameTh: 'รอบประเมินผลการปฏิบัติงานประจำปี 2569',
    period: 'Jan 2026 – Dec 2026',
    whatWeight: 60,
    howWeight: 40,
    // 3-Stage Due Dates configured by HR:
    // Stage 1: Employee OKR Draft & Submit (ended 6d ago)
    // Stage 2: Manager Review / Ping-Pong 5-day SLA (ended 1d ago)
    // Stage 3: HRBP Audit & Publish Fixed Window (due in 4 days)
    stage1DraftDeadline: daysAgo(6),
    stage2ApprovalDeadline: daysAgo(1),
    stage3HrAuditDeadline: daysFromNow(4),
    selfDeadline: daysAgo(4),
    managerDeadline: daysAgo(1),
    isGracePeriodActive: false,
    isLocked: false,
    isActive: true,
    rubricLevels: RUBRIC_LEVELS,
    competencies: COMPETENCIES,
  };

  const users = [
    // 1 Super Admin
    {
      id: 'usr-super',
      employeeCode: 'EMP-0001',
      email: 'krit.admin@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Kritnarin P.',
      nameTh: 'กฤตนรินทร์ พ.',
      title: 'System Super Administrator',
      department: 'IT & Governance',
      jobLevel: 'L4_LEAD',
      role: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE',
      managerId: null,
    },
    // 2 HR Admins
    {
      id: 'usr-hr',
      employeeCode: 'EMP-1001',
      email: 'pluem.hr@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Pluem Srisuk',
      nameTh: 'ปลื้ม ศรีสุข',
      title: 'People Operations Lead',
      department: 'Human Resources',
      jobLevel: 'L4_LEAD',
      role: 'HR_ADMIN',
      accountStatus: 'ACTIVE',
      managerId: 'usr-super',
    },
    {
      id: 'usr-hr-2',
      employeeCode: 'EMP-1002',
      email: 'siriporn.hr@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Siriporn Kamol',
      nameTh: 'ศิริพร กมล',
      title: 'HR Business Partner',
      department: 'Human Resources',
      jobLevel: 'L3_SENIOR',
      role: 'HR_ADMIN',
      accountStatus: 'ACTIVE',
      managerId: 'usr-hr',
    },
    // 3 Managers
    {
      id: 'usr-mgr-eng',
      employeeCode: 'EMP-2001',
      email: 'sarah.eng@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Sarah Chen',
      nameTh: 'ซาร่า เฉิน',
      title: 'Engineering Manager',
      department: 'Engineering',
      jobLevel: 'L4_LEAD',
      role: 'MANAGER',
      accountStatus: 'ACTIVE',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-mgr-sales',
      employeeCode: 'EMP-2002',
      email: 'somchai.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Somchai Wattana',
      nameTh: 'สมชาย วัฒนา',
      title: 'Enterprise Sales Director',
      department: 'Sales',
      jobLevel: 'L4_LEAD',
      role: 'MANAGER',
      accountStatus: 'ACTIVE',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-mgr-prod',
      employeeCode: 'EMP-2003',
      email: 'kanya.prod@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Kanya Rattanapong',
      nameTh: 'กัญญา รัตนพงศ์',
      title: 'Head of Product',
      department: 'Product',
      jobLevel: 'L4_LEAD',
      role: 'MANAGER',
      accountStatus: 'ACTIVE',
      managerId: 'usr-hr',
    },
    // 6 Active Employees (across L1 Junior -> L3 Senior)
    {
      id: 'usr-emp-nida',
      employeeCode: 'EMP-3001',
      email: 'nida.dev@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Nida Phanich',
      nameTh: 'นิดา พาณิชย์',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      jobLevel: 'L3_SENIOR',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-eng',
    },
    {
      id: 'usr-emp-ton',
      employeeCode: 'EMP-3002',
      email: 'ton.dev@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Tonrak Chaiyawat',
      nameTh: 'ต้นรัก ชัยวัฒน์',
      title: 'Frontend Engineer',
      department: 'Engineering',
      jobLevel: 'L2_MID',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-eng',
    },
    {
      id: 'usr-emp-may',
      employeeCode: 'EMP-3003',
      email: 'may.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Mayuree Lim',
      nameTh: 'มยุรี ลิ้ม',
      title: 'Enterprise Account Executive',
      department: 'Sales',
      jobLevel: 'L3_SENIOR',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-sales',
    },
    {
      id: 'usr-emp-art',
      employeeCode: 'EMP-3004',
      email: 'art.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Arthit Kongkiat',
      nameTh: 'อาทิตย์ ก้องเกียรติ',
      title: 'Account Executive',
      department: 'Sales',
      jobLevel: 'L2_MID',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-sales',
    },
    {
      id: 'usr-emp-fah',
      employeeCode: 'EMP-3005',
      email: 'fah.prod@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Fah Prapaporn',
      nameTh: 'ฟ้า ประภาพร',
      title: 'Product Designer',
      department: 'Product',
      jobLevel: 'L2_MID',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-prod',
    },
    {
      id: 'usr-emp-nut',
      employeeCode: 'EMP-3006',
      email: 'nut.ops@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Nattapong Meekul',
      nameTh: 'ณัฐพงศ์ มีกุล',
      title: 'Product Operations Analyst',
      department: 'Product',
      jobLevel: 'L1_JUNIOR',
      role: 'EMPLOYEE',
      accountStatus: 'ACTIVE',
      managerId: 'usr-mgr-prod',
    },
    // 4 New Employees Pending Super Admin Approval
    {
      id: 'usr-new-1',
      employeeCode: 'EMP-3091',
      email: 'pim.new@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Pimchanok Darunee',
      nameTh: 'พิมพ์ชนก ดรุณี',
      title: 'Junior Data Analyst',
      department: 'Operations',
      jobLevel: 'L1_JUNIOR',
      role: 'EMPLOYEE',
      accountStatus: 'PENDING_APPROVAL',
      managerId: 'usr-mgr-prod',
    },
    {
      id: 'usr-new-2',
      employeeCode: 'EMP-3092',
      email: 'tanapol.new@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Tanapol Worawit',
      nameTh: 'ธนพล วรวิทย์',
      title: 'People & Culture Specialist',
      department: 'Human Resources',
      jobLevel: 'L2_MID',
      role: 'HR_ADMIN',
      accountStatus: 'PENDING_APPROVAL',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-new-3',
      employeeCode: 'EMP-3093',
      email: 'chanya.new@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Chanya Suthida',
      nameTh: 'ชัญญา สุธิดา',
      title: 'Engineering Squad Lead',
      department: 'Engineering',
      jobLevel: 'L4_LEAD',
      role: 'MANAGER',
      accountStatus: 'PENDING_APPROVAL',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-new-4',
      employeeCode: 'EMP-3094',
      email: 'warut.new@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Warut Kittipong',
      nameTh: 'วรุตม์ กิตติพงศ์',
      title: 'Sales Representative',
      department: 'Sales',
      jobLevel: 'L1_JUNIOR',
      role: 'EMPLOYEE',
      accountStatus: 'PENDING_APPROVAL',
      managerId: 'usr-mgr-sales',
    },
  ];

  const goals = [
    { id: 'g-nida-1', cycleId: cycle.id, employeeId: 'usr-emp-nida', title: 'Cut payroll API p95 latency by 40%', titleTh: 'ลดเวลาตอบสนอง Payroll API (p95) ลง 40%', metricType: 'QUANTITATIVE', targetValue: '180', unit: 'ms (p95)', metric: 'p95 < 180ms', weight: 60, multiplier: 1.2, dueDate: '2026-10-31', actualValue: '145 ms', progressPct: 98 },
    { id: 'g-nida-2', cycleId: cycle.id, employeeId: 'usr-emp-nida', title: 'Zero P1 incidents during year-end peak', titleTh: 'ไม่เกิดเหตุระบบล่มระดับ P1 ช่วงปิดงบปลายปี', metricType: 'QUANTITATIVE', targetValue: '0', unit: 'P1 outages', metric: '0 P1 outages', weight: 40, multiplier: 1.1, dueDate: '2026-12-15', actualValue: '0 outages', progressPct: 100 },
    { id: 'g-ton-1', cycleId: cycle.id, employeeId: 'usr-emp-ton', title: 'Ship responsive ESS mobile self-service', titleTh: 'ส่งมอบหน้าจอ ESS รองรับมือถือทุกขนาด', metricType: 'QUALITATIVE', targetValue: 'WCAG AA + 95', unit: 'Lighthouse', metric: 'Lighthouse >= 95', weight: 50, multiplier: 1.1, dueDate: '2026-10-15', actualValue: 'Lighthouse 96', progressPct: 86 },
    { id: 'g-ton-2', cycleId: cycle.id, employeeId: 'usr-emp-ton', title: 'Reduce UI regression defects by 30%', titleTh: 'ลดบั๊กหน้าบ้านที่เกิดซ้ำลง 30%', metricType: 'QUANTITATIVE', targetValue: '30', unit: '% reduction', metric: '-30% bugs', weight: 50, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '24% reduction', progressPct: 78 },
    { id: 'g-may-1', cycleId: cycle.id, employeeId: 'usr-emp-may', title: 'Close 12M THB net-new enterprise ARR', titleTh: 'ปิดยอดขายลูกค้าองค์กรใหม่ 12 ล้านบาท', metricType: 'QUANTITATIVE', targetValue: '12', unit: 'M THB ARR', metric: '12M THB ARR', weight: 70, multiplier: 1.2, dueDate: '2026-12-20', actualValue: '12.6 M THB', progressPct: 96 },
    { id: 'g-may-2', cycleId: cycle.id, employeeId: 'usr-emp-may', title: 'Maintain renewal rate above 94%', titleTh: 'รักษาอัตราต่อสัญญาลูกค้าเดิมเกิน 94%', metricType: 'QUANTITATIVE', targetValue: '94', unit: '% GRR', metric: '>= 94% GRR', weight: 30, multiplier: 1.0, dueDate: '2026-12-20', actualValue: '95.2% GRR', progressPct: 95 },
    { id: 'g-art-1', cycleId: cycle.id, employeeId: 'usr-emp-art', title: 'Close 8M THB mid-market ARR', titleTh: 'ปิดยอดขายกลุ่ม Mid-Market 8 ล้านบาท', metricType: 'QUANTITATIVE', targetValue: '8', unit: 'M THB ARR', metric: '8M THB ARR', weight: 60, multiplier: 1.0, dueDate: '2026-12-20', actualValue: '5.9 M THB', progressPct: 74 },
    { id: 'g-art-2', cycleId: cycle.id, employeeId: 'usr-emp-art', title: 'Improve CRM pipeline hygiene to 95%', titleTh: 'อัปเดตข้อมูล Pipeline ใน CRM ครบ 95%', metricType: 'QUANTITATIVE', targetValue: '95', unit: '% complete', metric: '95% complete', weight: 40, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '70% complete', progressPct: 70 },
    { id: 'g-fah-1', cycleId: cycle.id, employeeId: 'usr-emp-fah', title: 'Redesign Leave & Attendance mobile UX', titleTh: 'ออกแบบ UX ระบบลางานและลงเวลาบนมือถือใหม่', metricType: 'QUALITATIVE', targetValue: '85', unit: 'SUS Score', metric: 'SUS >= 85', weight: 50, multiplier: 1.1, dueDate: '2026-10-31', actualValue: '', progressPct: 0 },
    { id: 'g-fah-2', cycleId: cycle.id, employeeId: 'usr-emp-fah', title: 'Unify design tokens across 4 HR modules', titleTh: 'รวม Design Tokens ให้เป็นมาตรฐานเดียวกัน 4 โมดูล', metricType: 'QUANTITATIVE', targetValue: '4', unit: 'HR modules', metric: '4/4 modules', weight: 50, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '', progressPct: 0 },
    { id: 'g-nut-1', cycleId: cycle.id, employeeId: 'usr-emp-nut', title: 'Deliver monthly HR analytics packs on time', titleTh: 'ส่งมอบรายงานวิเคราะห์ข้อมูล HR รายเดือนตรงเวลา', metricType: 'QUANTITATIVE', targetValue: '12', unit: 'packs/year', metric: '12/12 on time', weight: 60, multiplier: 1.0, dueDate: '2026-12-15', actualValue: '6/12 packs', progressPct: 45 },
    { id: 'g-nut-2', cycleId: cycle.id, employeeId: 'usr-emp-nut', title: 'Resolve customer data import tickets < 24h', titleTh: 'แก้ปัญหาไฟล์นำเข้าข้อมูลลูกค้าภายใน 24 ชม.', metricType: 'QUANTITATIVE', targetValue: '90', unit: '% SLA', metric: 'SLA >= 90%', weight: 40, multiplier: 1.0, dueDate: '2026-12-15', actualValue: '68% SLA', progressPct: 50 },
  ];

  const makeScoredReview = ({
    id,
    employeeId,
    managerId,
    status,
    revisionRound = 1,
    commentHistory = [],
    selfPayload,
    managerPayload,
    goalsSubmittedAt = null,
    goalsApprovedAt = null,
    selfSubmittedAt = null,
    managerSubmittedAt = null,
    publishedAt = null,
  }) => {
    const empGoals = goals.filter((g) => g.employeeId === employeeId);
    const scores = managerPayload
      ? computeReviewScores({
          goals: empGoals,
          goalRatings: managerPayload.goalRatings,
          competencyRatings: managerPayload.competencyRatings,
          cycle,
        })
      : { whatPct: null, whatScore: null, howScore: null, overallScore: null, nineBoxCell: null };

    return {
      id,
      cycleId: cycle.id,
      employeeId,
      managerId,
      status,
      revisionRound,
      commentHistory,
      selfPayload,
      managerPayload,
      ...scores,
      goalsSubmittedAt,
      goalsApprovedAt,
      selfSubmittedAt,
      managerSubmittedAt,
      extendedDeadline: null,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      publishedAt,
    };
  };

  const reviews = [
    // 1. Nida (L3 Senior) — PUBLISHED early (5 days before Stage 3 HR deadline!)
    makeScoredReview({
      id: 'rev-nida',
      employeeId: 'usr-emp-nida',
      managerId: 'usr-mgr-eng',
      status: 'PUBLISHED',
      goalsSubmittedAt: daysAgo(9),
      goalsApprovedAt: daysAgo(7),
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: daysAgo(3),
      publishedAt: daysAgo(1),
      commentHistory: [
        { id: 'cmt-nida-1', round: 1, phase: 'GOAL', actorName: 'Nida Phanich', actorRole: 'EMPLOYEE', action: 'GOAL_SUBMITTED', comment: 'Proposed 2 high-impact payroll reliability OKRs (100% weight).', createdAt: daysAgo(9) },
        { id: 'cmt-nida-2', round: 1, phase: 'GOAL', actorName: 'Sarah Chen', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Strong L3 Senior stretch targets — approved with 1.2x & 1.1x multipliers.', createdAt: daysAgo(7) },
        { id: 'cmt-nida-3', round: 1, phase: 'RELEASE', actorName: 'Pluem Srisuk', actorRole: 'HR_ADMIN', action: 'PUBLISHED', comment: 'HR approved and published final performance outcome.', createdAt: daysAgo(1) },
      ],
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-nida-1', selfScore: 5, selfEvidence: 'Rewrote payroll batch queries and added composite indexes, cutting p95 from 340ms to 145ms.' },
          { goalId: 'g-nida-2', selfScore: 5, selfEvidence: 'Led load testing for 50k concurrent payslips with zero P1 outages in Q4.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 5, selfNote: 'Owned incident runbooks and on-call readiness.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Paired with QA and Product to de-risk tax rule changes.' },
          { competencyId: 'comp-problem', selfScore: 5, selfNote: 'Eliminated recurring deadlocks in batch disbursement.' },
        ],
        reflection: 'Proud of stabilizing payroll at peak scale and mentoring two junior engineers.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-nida-1', score: 5, evidence: 'Verified 57% p95 latency reduction in production APM across 1,000+ enterprise tenants.' },
          { goalId: 'g-nida-2', score: 5, evidence: 'Zero P1 incidents during December bonus run; documented reusable load-test harness.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 5, evidence: 'Proactively surfaced DB pool bottlenecks 3 weeks before year-end peak and fixed them.' },
          { competencyId: 'comp-collab', score: 4, evidence: 'Strong technical partner to Product and Customer Success during enterprise onboarding.' },
          { competencyId: 'comp-problem', score: 5, evidence: 'Solved long-standing payroll lock contention with clean transactional partitioning.' },
        ],
        managerSummary: 'Exceptional year. Nida set the engineering bar for reliability and mentored peers effectively.',
        developmentFocus: 'Lead cross-squad architecture reviews and represent Engineering in enterprise technical pre-sales.',
      },
    }),

    // 2. Ton (L2 Mid) — SELF_REVIEW_SUBMITTED (Overdue Stage 2 Manager SLA!)
    makeScoredReview({
      id: 'rev-ton',
      employeeId: 'usr-emp-ton',
      managerId: 'usr-mgr-eng',
      status: 'SELF_REVIEW_SUBMITTED',
      goalsSubmittedAt: daysAgo(9),
      goalsApprovedAt: daysAgo(7),
      selfSubmittedAt: daysAgo(4),
      managerSubmittedAt: null,
      commentHistory: [
        { id: 'cmt-ton-1', round: 1, phase: 'GOAL', actorName: 'Sarah Chen', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Approved ESS mobile and regression OKRs for L2 Mid scope.', createdAt: daysAgo(7) },
        { id: 'cmt-ton-2', round: 1, phase: 'REVIEW', actorName: 'Tonrak Chaiyawat', actorRole: 'EMPLOYEE', action: 'SELF_REVIEW_SUBMITTED', comment: 'Submitted Q4 actual achievements and self ratings.', createdAt: daysAgo(4) },
      ],
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-ton-1', selfScore: 4, selfEvidence: 'Delivered mobile-first ESS screens tested across iOS and Android viewports.' },
          { goalId: 'g-ton-2', selfScore: 3, selfEvidence: 'Added component lint rules and cut regression tickets by 24% so far.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 4, selfNote: 'Took ownership of accessibility fixes across forms.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Worked closely with Design on spacing and contrast tokens.' },
          { competencyId: 'comp-problem', selfScore: 3, selfNote: 'Improving automated test coverage next quarter.' },
        ],
        reflection: 'Delivered responsive ESS screens cleanly; want to deepen state-management testing.',
      },
      managerPayload: null,
    }),

    // 3 & 4. Sales team under Somchai (MANAGER_APPROVED -> ready for HR Approve & Publish or Return due to Bias Alert!)
    makeScoredReview({
      id: 'rev-may',
      employeeId: 'usr-emp-may',
      managerId: 'usr-mgr-sales',
      status: 'MANAGER_APPROVED',
      revisionRound: 1,
      goalsSubmittedAt: daysAgo(10),
      goalsApprovedAt: daysAgo(8),
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: daysAgo(2),
      commentHistory: [
        { id: 'cmt-may-1', round: 1, phase: 'GOAL', actorName: 'Somchai Wattana', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Enterprise ARR target 12M THB approved with 1.2x breakthrough multiplier.', createdAt: daysAgo(8) },
      ],
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-may-1', selfScore: 5, selfEvidence: 'Closed 12.6M THB ARR including two SET-listed manufacturing groups.' },
          { goalId: 'g-may-2', selfScore: 4, selfEvidence: 'Achieved 95.2% renewal rate across enterprise portfolio.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 5, selfNote: 'Drove complex procurement cycles end-to-end.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Aligned implementation handoffs with CS.' },
          { competencyId: 'comp-problem', selfScore: 4, selfNote: 'Structured multi-year rollout plans.' },
        ],
        reflection: 'Exceeded annual enterprise quota and improved handoff quality.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-may-1', score: 5, evidence: 'Delivered 105% of 12M THB enterprise target with two marquee listed-company logos.' },
          { goalId: 'g-may-2', score: 5, evidence: 'Maintained 95.2% GRR and expanded multi-module adoption across existing accounts.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 5, evidence: 'Consistently leads enterprise deal reviews and forecasts accurately every month.' },
          { competencyId: 'comp-collab', score: 5, evidence: 'Co-created enterprise onboarding checklist with Customer Success team.' },
          { competencyId: 'comp-problem', score: 5, evidence: 'Resolved complex multi-entity payroll compliance objections during procurement.' },
        ],
        managerSummary: 'Top enterprise closer this year with strong retention.',
        developmentFocus: 'Mentor junior AEs on executive discovery and multi-stakeholder deals.',
      },
    }),

    makeScoredReview({
      id: 'rev-art',
      employeeId: 'usr-emp-art',
      managerId: 'usr-mgr-sales',
      status: 'MANAGER_APPROVED',
      revisionRound: 1,
      goalsSubmittedAt: daysAgo(10),
      goalsApprovedAt: daysAgo(8),
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: daysAgo(2),
      commentHistory: [
        { id: 'cmt-art-1', round: 1, phase: 'GOAL', actorName: 'Somchai Wattana', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Mid-market 8M THB quota approved.', createdAt: daysAgo(8) },
      ],
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-art-1', selfScore: 3, selfEvidence: 'Closed 5.9M THB ARR; two Q4 deals slipped to Q1.' },
          { goalId: 'g-art-2', selfScore: 3, selfEvidence: 'Updated CRM stages weekly in H2.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 3, selfNote: 'Working on earlier deal qualification.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Good teamwork during trade shows.' },
          { competencyId: 'comp-problem', selfScore: 3, selfNote: 'Improving objection handling.' },
        ],
        reflection: 'Solid pipeline built for Q1; need tighter closing discipline.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-art-1', score: 5, evidence: 'Strong effort throughout the year and built a promising Q1 enterprise pipeline.' },
          { goalId: 'g-art-2', score: 5, evidence: 'Very responsive in weekly sales standups and helpful to teammates in Q4.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 5, evidence: 'Always willing to pick up inbound leads and support weekend client demos.' },
          { competencyId: 'comp-collab', score: 5, evidence: 'Great energy in team meetings and always supports fellow account executives.' },
          { competencyId: 'comp-problem', score: 5, evidence: 'Creative follow-up approach with mid-market prospects during slow months.' },
        ],
        managerSummary: 'Great attitude and high potential for next year.',
        developmentFocus: 'Accelerate closing cadence on late-stage pipeline.',
      },
    }),

    // 5. Fah (L2 Mid Product) — Ping-Pong Round 2! Triggers HRBP Audit & Advisor Intervention!
    makeScoredReview({
      id: 'rev-fah',
      employeeId: 'usr-emp-fah',
      managerId: 'usr-mgr-prod',
      status: 'GOAL_REVISION_REQUIRED',
      revisionRound: 2,
      goalsSubmittedAt: daysAgo(8),
      goalsApprovedAt: null,
      commentHistory: [
        { id: 'cmt-fah-1', round: 1, phase: 'GOAL', actorName: 'Fah Prapaporn', actorRole: 'EMPLOYEE', action: 'GOAL_SUBMITTED', comment: 'Proposed 2 annual UX OKRs totaling 100% weight.', createdAt: daysAgo(9) },
        { id: 'cmt-fah-2', round: 1, phase: 'GOAL', actorName: 'Kanya Rattanapong', actorRole: 'MANAGER', action: 'GOAL_REVISION_REQUESTED', comment: 'Good start! Please raise mobile UX target to SUS >= 88 (1.1x Stretch) and clarify token adoption metric.', createdAt: daysAgo(7) },
        { id: 'cmt-fah-3', round: 2, phase: 'GOAL', actorName: 'Fah Prapaporn', actorRole: 'EMPLOYEE', action: 'GOAL_SUBMITTED', comment: 'Updated mobile UX milestone details; kept weight 50/50.', createdAt: daysAgo(5) },
        { id: 'cmt-fah-4', round: 2, phase: 'GOAL', actorName: 'Kanya Rattanapong', actorRole: 'MANAGER', action: 'GOAL_REVISION_REQUESTED', comment: 'Still need clearer measurable criteria for the 4 HR modules before locking OKRs.', createdAt: daysAgo(3) },
      ],
      selfPayload: null,
      managerPayload: null,
    }),

    // 6. Nut (L1 Junior Product Ops) — Low Performer, MANAGER_APPROVED (hidden from Employee until HR Approve & Publish!)
    makeScoredReview({
      id: 'rev-nut',
      employeeId: 'usr-emp-nut',
      managerId: 'usr-mgr-prod',
      status: 'MANAGER_APPROVED',
      revisionRound: 1,
      goalsSubmittedAt: daysAgo(9),
      goalsApprovedAt: daysAgo(7),
      selfSubmittedAt: daysAgo(4),
      managerSubmittedAt: daysAgo(2),
      commentHistory: [
        { id: 'cmt-nut-1', round: 1, phase: 'REVIEW', actorName: 'Kanya Rattanapong', actorRole: 'MANAGER', action: 'MANAGER_APPROVED', comment: 'Submitted L1 Junior evaluation with structured 90-day coaching plan for HR review.', createdAt: daysAgo(2) },
      ],
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-nut-1', selfScore: 2, selfEvidence: 'Delivered 6 of 12 monthly packs on time due to data cleanup bottlenecks.' },
          { goalId: 'g-nut-2', selfScore: 2, selfEvidence: 'Ticket SLA averaged 68% during peak onboarding months.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 2, selfNote: 'Need better escalation when blocked.' },
          { competencyId: 'comp-collab', selfScore: 3, selfNote: 'Communicated with CS team on recurring formats.' },
          { competencyId: 'comp-problem', selfScore: 2, selfNote: 'Need structured SQL validation skills.' },
        ],
        reflection: 'Struggled with data volume this year and would appreciate structured coaching.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-nut-1', score: 2, evidence: 'Missed 6 of 12 monthly analytics deadlines without early risk escalation to stakeholders.' },
          { goalId: 'g-nut-2', score: 2, evidence: 'Customer import SLA remained at 68% vs 90% target despite template improvements.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 2, evidence: 'Blockers were surfaced after deadlines passed rather than proactively during check-ins.' },
          { competencyId: 'comp-collab', score: 2, evidence: 'Repeated rework required from CS due to incomplete handoff notes on import errors.' },
          { competencyId: 'comp-problem', score: 2, evidence: 'Relied on manual spreadsheet fixes instead of adopting the automated validation script.' },
        ],
        managerSummary: 'Performance fell below L1 Junior expectations across delivery reliability and SLA.',
        developmentFocus: '90-day structured Performance Improvement Plan (PIP) with weekly check-ins and SQL automation coaching.',
      },
    }),
  ];

  // Role-Scoped Seeded Activity Logs covering all 4 visibility scopes:
  // ADMIN_SECURITY | CYCLE_GOVERNANCE | HR_INTERNAL | TEAM_MANAGER | PUBLIC_SELF
  const auditLogs = [
    {
      id: 'aud-1',
      cycleId: cycle.id,
      reviewId: 'rev-nida',
      actorId: 'usr-hr',
      actorName: 'Pluem Srisuk',
      actorRole: 'HR_ADMIN',
      action: 'PUBLISH',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: 'usr-emp-nida',
      targetManagerId: 'usr-mgr-eng',
      reason: 'HR approved and published FY 2026 final performance outcome for Nida Phanich (5d early).',
      metadata: { count: 1 },
      createdAt: daysAgo(1),
    },
    {
      id: 'aud-2',
      cycleId: cycle.id,
      reviewId: 'rev-art',
      actorId: 'usr-hr',
      actorName: 'Pluem Srisuk',
      actorRole: 'HR_ADMIN',
      action: 'BIAS_ALERT_FLAGGED',
      visibilityScope: 'HR_INTERNAL',
      targetEmployeeId: 'usr-emp-art',
      targetManagerId: 'usr-mgr-sales',
      reason: 'Internal HR Alert: Sales team average (5.00) exceeds org benchmark (+0.88). Recommended HR review before publishing.',
      metadata: { flagType: 'LENIENCY_BIAS' },
      createdAt: daysAgo(1),
    },
    {
      id: 'aud-3',
      cycleId: cycle.id,
      reviewId: 'rev-nut',
      actorId: 'usr-mgr-prod',
      actorName: 'Kanya Rattanapong',
      actorRole: 'MANAGER',
      action: 'MANAGER_APPROVED',
      visibilityScope: 'TEAM_MANAGER',
      targetEmployeeId: 'usr-emp-nut',
      targetManagerId: 'usr-mgr-prod',
      reason: 'Submitted manager evaluation for Nattapong Meekul to HR review queue (hidden from employee until published).',
      metadata: { overallScore: 2.0 },
      createdAt: daysAgo(2),
    },
    {
      id: 'aud-4',
      cycleId: cycle.id,
      reviewId: 'rev-fah',
      actorId: 'usr-mgr-prod',
      actorName: 'Kanya Rattanapong',
      actorRole: 'MANAGER',
      action: 'GOAL_REVISION_REQUESTED',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: 'usr-emp-fah',
      targetManagerId: 'usr-mgr-prod',
      reason: 'Returned OKRs to Fah Prapaporn (Round 2) requesting measurable module criteria.',
      metadata: { round: 2 },
      createdAt: daysAgo(3),
    },
    {
      id: 'aud-5',
      cycleId: cycle.id,
      reviewId: 'rev-ton',
      actorId: 'usr-emp-ton',
      actorName: 'Tonrak Chaiyawat',
      actorRole: 'EMPLOYEE',
      action: 'SELF_REVIEW_SUBMITTED',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: 'usr-emp-ton',
      targetManagerId: 'usr-mgr-eng',
      reason: 'Tonrak Chaiyawat submitted self-assessment and OKR achievements to Sarah Chen.',
      metadata: {},
      createdAt: daysAgo(4),
    },
    {
      id: 'aud-6',
      cycleId: cycle.id,
      reviewId: null,
      actorId: 'usr-hr',
      actorName: 'Pluem Srisuk',
      actorRole: 'HR_ADMIN',
      action: 'UPDATE_STAGE_DEADLINES',
      visibilityScope: 'CYCLE_GOVERNANCE',
      targetEmployeeId: null,
      targetManagerId: null,
      reason: 'Configured 3-Stage Due Dates: Stage 1 OKR Draft, Stage 2 Manager 5d SLA, Stage 3 HRBP Audit & Publish window.',
      metadata: {},
      createdAt: daysAgo(10),
    },
    {
      id: 'aud-7',
      cycleId: null,
      reviewId: null,
      actorId: 'usr-super',
      actorName: 'Kritnarin P.',
      actorRole: 'SUPER_ADMIN',
      action: 'USER_REGISTERED',
      visibilityScope: 'ADMIN_SECURITY',
      targetEmployeeId: 'usr-new-1',
      targetManagerId: null,
      reason: '4 new employee registrations (EMP-3091 to EMP-3094) queued for Super Admin role approval.',
      metadata: { count: 4 },
      createdAt: daysAgo(2),
    },
  ];

  const rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS);

  return { cycle, users, goals, reviews, auditLogs, rolePermissions, nextDeadlineSample: daysFromNow(4) };
}
