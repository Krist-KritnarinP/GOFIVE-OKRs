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
    selfDeadline: daysAgo(4),
    managerDeadline: daysAgo(2),
    isGracePeriodActive: false,
    isLocked: false,
    isActive: true,
    rubricLevels: RUBRIC_LEVELS,
    competencies: COMPETENCIES,
  };

  const users = [
    {
      id: 'usr-hr',
      email: 'pluem.hr@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Pluem Srisuk',
      nameTh: 'ปลื้ม ศรีสุข',
      title: 'People Operations Lead',
      department: 'Human Resources',
      role: 'HR_ADMIN',
      managerId: null,
    },
    {
      id: 'usr-mgr-eng',
      email: 'sarah.eng@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Sarah Chen',
      nameTh: 'ซาร่า เฉิน',
      title: 'Engineering Manager',
      department: 'Engineering',
      role: 'MANAGER',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-mgr-sales',
      email: 'somchai.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Somchai Wattana',
      nameTh: 'สมชาย วัฒนา',
      title: 'Enterprise Sales Director',
      department: 'Sales',
      role: 'MANAGER',
      managerId: 'usr-hr',
    },
    {
      id: 'usr-mgr-prod',
      email: 'kanya.prod@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Kanya Rattanapong',
      nameTh: 'กัญญา รัตนพงศ์',
      title: 'Head of Product',
      department: 'Product',
      role: 'MANAGER',
      managerId: 'usr-hr',
    },
    // Engineering direct reports (Sarah Chen)
    {
      id: 'usr-emp-nida',
      email: 'nida.dev@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Nida Phanich',
      nameTh: 'นิดา พาณิชย์',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-eng',
    },
    {
      id: 'usr-emp-ton',
      email: 'ton.dev@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Tonrak Chaiyawat',
      nameTh: 'ต้นรัก ชัยวัฒน์',
      title: 'Frontend Engineer',
      department: 'Engineering',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-eng',
    },
    {
      id: 'usr-emp-bank',
      email: 'bank.qa@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Bank Jiraporn',
      nameTh: 'แบงค์ จิราพร',
      title: 'QA Automation Engineer',
      department: 'Engineering',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-eng',
    },
    // Sales direct reports (Somchai — triggers Leniency Bias Alert!)
    {
      id: 'usr-emp-may',
      email: 'may.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Mayuree Lim',
      nameTh: 'มยุรี ลิ้ม',
      title: 'Enterprise Account Executive',
      department: 'Sales',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-sales',
    },
    {
      id: 'usr-emp-art',
      email: 'art.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Arthit Kongkiat',
      nameTh: 'อาทิตย์ ก้องเกียรติ',
      title: 'Account Executive',
      department: 'Sales',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-sales',
    },
    {
      id: 'usr-emp-beam',
      email: 'beam.sales@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Beam Chotika',
      nameTh: 'บีม โชติกา',
      title: 'Sales Operations Specialist',
      department: 'Sales',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-sales',
    },
    // Product direct reports (Kanya — includes Low Performer + High Potential)
    {
      id: 'usr-emp-fah',
      email: 'fah.prod@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Fah Prapaporn',
      nameTh: 'ฟ้า ประภาพร',
      title: 'Product Designer',
      department: 'Product',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-prod',
    },
    {
      id: 'usr-emp-nut',
      email: 'nut.ops@empeo.demo',
      passwordHash: DEMO_PASSWORD_HASH,
      name: 'Nattapong Meekul',
      nameTh: 'ณัฐพงศ์ มีกุล',
      title: 'Product Operations Analyst',
      department: 'Product',
      role: 'EMPLOYEE',
      managerId: 'usr-mgr-prod',
    },
  ];

  const goals = [
    // Nida (Star / High Performer — Published)
    { id: 'g-nida-1', cycleId: cycle.id, employeeId: 'usr-emp-nida', title: 'Cut payroll API p95 latency by 40%', titleTh: 'ลดเวลาตอบสนอง Payroll API (p95) ลง 40%', metric: 'p95 < 180ms', weight: 60, progressPct: 98 },
    { id: 'g-nida-2', cycleId: cycle.id, employeeId: 'usr-emp-nida', title: 'Zero P1 incidents during year-end peak', titleTh: 'ไม่เกิดเหตุระบบล่มระดับ P1 ช่วงปิดงบปลายปี', metric: '0 P1 outages', weight: 40, progressPct: 100 },
    // Ton (Overdue Manager Review — waiting on Sarah)
    { id: 'g-ton-1', cycleId: cycle.id, employeeId: 'usr-emp-ton', title: 'Ship responsive ESS mobile self-service', titleTh: 'ส่งมอบหน้าจอ ESS รองรับมือถือทุกขนาด', metric: 'Lighthouse >= 95', weight: 50, progressPct: 86 },
    { id: 'g-ton-2', cycleId: cycle.id, employeeId: 'usr-emp-ton', title: 'Reduce UI regression defects by 30%', titleTh: 'ลดบั๊กหน้าบ้านที่เกิดซ้ำลง 30%', metric: '-30% bugs', weight: 50, progressPct: 78 },
    // Bank (Overdue Self-Review — DRAFT)
    { id: 'g-bank-1', cycleId: cycle.id, employeeId: 'usr-emp-bank', title: 'Automate 80% of payroll smoke tests', titleTh: 'ทำ Automated Smoke Test ระบบเงินเดือนครบ 80%', metric: '80% coverage', weight: 60, progressPct: 62 },
    { id: 'g-bank-2', cycleId: cycle.id, employeeId: 'usr-emp-bank', title: 'Cut release QA cycle from 3 days to 1 day', titleTh: 'ลดเวลาตรวจรับงานก่อนปล่อยจาก 3 วันเหลือ 1 วัน', metric: '<= 1 day', weight: 40, progressPct: 58 },
    // May (Sales — Rated 5/5 by Somchai)
    { id: 'g-may-1', cycleId: cycle.id, employeeId: 'usr-emp-may', title: 'Close 12M THB net-new enterprise ARR', titleTh: 'ปิดยอดขายลูกค้าองค์กรใหม่ 12 ล้านบาท', metric: '12M THB ARR', weight: 70, progressPct: 96 },
    { id: 'g-may-2', cycleId: cycle.id, employeeId: 'usr-emp-may', title: 'Maintain renewal rate above 94%', titleTh: 'รักษาอัตราต่อสัญญาลูกค้าเดิมเกิน 94%', metric: '>= 94% GRR', weight: 30, progressPct: 95 },
    // Art (Sales — Rated 5/5 by Somchai despite mid progress → Bias Signal!)
    { id: 'g-art-1', cycleId: cycle.id, employeeId: 'usr-emp-art', title: 'Close 8M THB mid-market ARR', titleTh: 'ปิดยอดขายกลุ่ม Mid-Market 8 ล้านบาท', metric: '8M THB ARR', weight: 60, progressPct: 74 },
    { id: 'g-art-2', cycleId: cycle.id, employeeId: 'usr-emp-art', title: 'Improve CRM pipeline hygiene to 95%', titleTh: 'อัปเดตข้อมูล Pipeline ใน CRM ครบ 95%', metric: '95% complete', weight: 40, progressPct: 70 },
    // Beam (Sales — Rated 4.8/5 by Somchai)
    { id: 'g-beam-1', cycleId: cycle.id, employeeId: 'usr-emp-beam', title: 'Cut quote turnaround time to < 4 hours', titleTh: 'ลดเวลาออกใบเสนอราคาเหลือไม่เกิน 4 ชั่วโมง', metric: '< 4 hrs', weight: 50, progressPct: 88 },
    { id: 'g-beam-2', cycleId: cycle.id, employeeId: 'usr-emp-beam', title: 'Onboard 100% of new reps on playbook', titleTh: 'อบรมเซลส์ใหม่ตามคู่มือครบ 100%', metric: '100% trained', weight: 50, progressPct: 92 },
    // Fah (Product — High Potential / Ready for Release)
    { id: 'g-fah-1', cycleId: cycle.id, employeeId: 'usr-emp-fah', title: 'Redesign Leave & Attendance mobile UX', titleTh: 'ออกแบบ UX ระบบลางานและลงเวลาบนมือถือใหม่', metric: 'SUS >= 85', weight: 50, progressPct: 82 },
    { id: 'g-fah-2', cycleId: cycle.id, employeeId: 'usr-emp-fah', title: 'Unify design tokens across 4 HR modules', titleTh: 'รวม Design Tokens ให้เป็นมาตรฐานเดียวกัน 4 โมดูล', metric: '4/4 modules', weight: 50, progressPct: 76 },
    // Nut (Product Ops — Low Performer / Needs Action)
    { id: 'g-nut-1', cycleId: cycle.id, employeeId: 'usr-emp-nut', title: 'Deliver monthly HR analytics packs on time', titleTh: 'ส่งมอบรายงานวิเคราะห์ข้อมูล HR รายเดือนตรงเวลา', metric: '12/12 on time', weight: 60, progressPct: 45 },
    { id: 'g-nut-2', cycleId: cycle.id, employeeId: 'usr-emp-nut', title: 'Resolve customer data import tickets < 24h', titleTh: 'แก้ปัญหาไฟล์นำเข้าข้อมูลลูกค้าภายใน 24 ชม.', metric: 'SLA >= 90%', weight: 40, progressPct: 50 },
  ];

  const makeScoredReview = ({
    id,
    employeeId,
    managerId,
    status,
    selfPayload,
    managerPayload,
    selfSubmittedAt,
    managerSubmittedAt,
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
      selfPayload,
      managerPayload,
      ...scores,
      selfSubmittedAt,
      managerSubmittedAt,
      extendedDeadline: null,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      publishedAt,
    };
  };

  const reviews = [
    // 1. Nida — High Performer (PUBLISHED so Employee view shows full transparent breakdown!)
    makeScoredReview({
      id: 'rev-nida',
      employeeId: 'usr-emp-nida',
      managerId: 'usr-mgr-eng',
      status: 'PUBLISHED',
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
      selfSubmittedAt: daysAgo(7),
      managerSubmittedAt: daysAgo(4),
      publishedAt: daysAgo(1),
    }),

    // 2. Ton — SELF_REVIEW_SUBMITTED (Overdue Manager Review! Ready for Manager to evaluate in Drawer)
    makeScoredReview({
      id: 'rev-ton',
      employeeId: 'usr-emp-ton',
      managerId: 'usr-mgr-eng',
      status: 'SELF_REVIEW_SUBMITTED',
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
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: null,
    }),

    // 3. Bank — DRAFT (Overdue Employee Self-Review!)
    makeScoredReview({
      id: 'rev-bank',
      employeeId: 'usr-emp-bank',
      managerId: 'usr-mgr-eng',
      status: 'DRAFT',
      selfPayload: null,
      managerPayload: null,
      selfSubmittedAt: null,
      managerSubmittedAt: null,
    }),

    // 4–6. Sales team under Somchai (Lenient 5/5 ratings → triggers HR Leniency Bias Alert!)
    makeScoredReview({
      id: 'rev-may',
      employeeId: 'usr-emp-may',
      managerId: 'usr-mgr-sales',
      status: 'READY_FOR_RELEASE',
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-may-1', selfScore: 5, selfEvidence: 'Closed 12.6M THB ARR including two SET-listed manufacturing groups.' },
          { goalId: 'g-may-2', selfScore: 4, selfEvidence: 'Achieved 95.2% renewal rate across enterprise portfolio.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 5, selfNote: 'Drove complex procurement cycles end-to-end.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Aligned implementation handoffs with CS.' },
          { competencyId: 'comp-problem', selfScore: 4, selfNote: 'Structured multi-year rollout plans for large clients.' },
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
      selfSubmittedAt: daysAgo(6),
      managerSubmittedAt: daysAgo(3),
    }),

    makeScoredReview({
      id: 'rev-art',
      employeeId: 'usr-emp-art',
      managerId: 'usr-mgr-sales',
      status: 'READY_FOR_RELEASE',
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
      selfSubmittedAt: daysAgo(6),
      managerSubmittedAt: daysAgo(3),
    }),

    makeScoredReview({
      id: 'rev-beam',
      employeeId: 'usr-emp-beam',
      managerId: 'usr-mgr-sales',
      status: 'READY_FOR_RELEASE',
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-beam-1', selfScore: 4, selfEvidence: 'Average quote SLA improved to 3.4 hours.' },
          { goalId: 'g-beam-2', selfScore: 4, selfEvidence: 'Trained all 6 new hires on updated sales playbook.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 4, selfNote: 'Reliable quote operations.' },
          { competencyId: 'comp-collab', selfScore: 4, selfNote: 'Partnered smoothly with Finance.' },
          { competencyId: 'comp-problem', selfScore: 4, selfNote: 'Automated approval routing.' },
        ],
        reflection: 'Strong operational improvements across quoting and onboarding.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-beam-1', score: 5, evidence: 'Cut quote turnaround to 3.4 hours and eliminated manual pricing spreadsheet errors.' },
          { goalId: 'g-beam-2', score: 5, evidence: 'Onboarded 100% of new sales reps with positive ramp feedback.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 5, evidence: 'Owned end-to-end pricing desk reliability during Q4 peak volume.' },
          { competencyId: 'comp-collab', score: 4, evidence: 'Great coordination between Sales and Finance teams.' },
          { competencyId: 'comp-problem', score: 5, evidence: 'Streamlined discount approval templates saving 6 hours per week.' },
        ],
        managerSummary: 'Backbone of sales operations.',
        developmentFocus: 'Expand into revenue analytics and forecasting automation.',
      },
      selfSubmittedAt: daysAgo(6),
      managerSubmittedAt: daysAgo(3),
    }),

    // 7. Fah (Product — High Impact Growth / Ready for Release)
    makeScoredReview({
      id: 'rev-fah',
      employeeId: 'usr-emp-fah',
      managerId: 'usr-mgr-prod',
      status: 'READY_FOR_RELEASE',
      selfPayload: {
        goalAssessments: [
          { goalId: 'g-fah-1', selfScore: 4, selfEvidence: 'Shipped Leave & Attendance redesign with 87 SUS usability score.' },
          { goalId: 'g-fah-2', selfScore: 3, selfEvidence: 'Completed tokens for 3 of 4 modules; final module in QA.' },
        ],
        competencyAssessments: [
          { competencyId: 'comp-ownership', selfScore: 4, selfNote: 'Led user testing sessions with 18 HR admins.' },
          { competencyId: 'comp-collab', selfScore: 5, selfNote: 'Co-designed directly with engineers.' },
          { competencyId: 'comp-problem', selfScore: 4, selfNote: 'Simplified complex shift-scheduling flows.' },
        ],
        reflection: 'Strong usability gains; focusing on finishing the 4th module token migration.',
      },
      managerPayload: {
        goalRatings: [
          { goalId: 'g-fah-1', score: 4, evidence: 'Usability score reached 87 SUS and reduced support tickets on mobile clock-in.' },
          { goalId: 'g-fah-2', score: 3, evidence: '3 of 4 modules migrated cleanly; remaining module scheduled for Jan.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 4, evidence: 'Consistently validates designs with real HR users before handoff.' },
          { competencyId: 'comp-collab', score: 5, evidence: 'Raised design-engineering velocity by pairing directly on accessible UI tokens.' },
          { competencyId: 'comp-problem', score: 4, evidence: 'Turned dense shift rules into an intuitive visual schedule.' },
        ],
        managerSummary: 'High-potential designer with standout collaboration and user empathy.',
        developmentFocus: 'Drive design system governance across all HRD modules.',
      },
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: daysAgo(2),
    }),

    // 8. Nut (Product Ops — Low Performer / Needs Action — Ready for Release)
    makeScoredReview({
      id: 'rev-nut',
      employeeId: 'usr-emp-nut',
      managerId: 'usr-mgr-prod',
      status: 'READY_FOR_RELEASE',
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
        managerSummary: 'Performance fell below role expectations across delivery reliability and SLA.',
        developmentFocus: '90-day structured Performance Improvement Plan (PIP) with weekly check-ins and SQL automation coaching.',
      },
      selfSubmittedAt: daysAgo(5),
      managerSubmittedAt: daysAgo(2),
    }),
  ];

  const auditLogs = [
    {
      id: 'aud-1',
      cycleId: cycle.id,
      reviewId: 'rev-nida',
      actorId: 'usr-hr',
      actorName: 'Pluem Srisuk',
      action: 'PUBLISH',
      reason: 'Early pilot verification completed for Engineering senior review.',
      metadata: { count: 1 },
      createdAt: daysAgo(1),
    },
  ];

  return { cycle, users, goals, reviews, auditLogs, nextDeadlineSample: daysFromNow(5) };
}
