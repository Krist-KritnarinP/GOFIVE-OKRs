import { COMPETENCIES, RUBRIC_LEVELS } from '../constants/rubric.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/roles.js';

const ROUND2 = (n) => Math.round(n * 100) / 100;

export function computeNineBoxCell(whatPct, howScore) {
  if (whatPct == null || howScore == null) return null;
  const xBand = whatPct >= 90 ? 'HIGH' : whatPct >= 65 ? 'MID' : 'LOW';
  const yBand = howScore >= 4.0 ? 'HIGH' : howScore >= 2.6 ? 'MID' : 'LOW';
  const map = {
    'HIGH:HIGH': 'STAR_HIGH_PERFORMER',
    'MID:HIGH': 'HIGH_IMPACT_GROWTH',
    'LOW:HIGH': 'HIGH_POTENTIAL_EMERGING',
    'HIGH:MID': 'CONSISTENT_CONTRIBUTOR',
    'MID:MID': 'CORE_PERFORMER',
    'LOW:MID': 'DEVELOPING_TALENT',
    'HIGH:LOW': 'EFFECTIVE_SPECIALIST',
    'MID:LOW': 'INCONSISTENT_PERFORMER',
    'LOW:LOW': 'NEEDS_ACTION_LOW_PERFORMER',
  };
  return map[`${xBand}:${yBand}`] || 'CORE_PERFORMER';
}

export function computeScoresClient({ goals, goalRatings, competencyRatings, cycle }) {
  const goalMap = new Map(goals.map((g) => [g.id, g]));
  let totalWeight = 0;
  let weightedGoalScore = 0;
  let weightedProgress = 0;

  for (const r of goalRatings) {
    const goal = goalMap.get(r.goalId);
    const weight = goal ? goal.weight : 1;
    const multiplier = goal?.multiplier ?? 1.0;
    const adjustedScore = Math.min(5, r.score * multiplier);
    totalWeight += weight;
    weightedGoalScore += adjustedScore * weight;
    const ratingPct = (adjustedScore / 5) * 100;
    const blended = goal ? goal.progressPct * 0.6 + ratingPct * 0.4 : ratingPct;
    weightedProgress += blended * weight;
  }

  const whatScore = totalWeight > 0 ? ROUND2(weightedGoalScore / totalWeight) : 0;
  const whatPct = totalWeight > 0 ? ROUND2(weightedProgress / totalWeight) : 0;
  const howScore =
    competencyRatings.length > 0
      ? ROUND2(competencyRatings.reduce((a, b) => a + b.score, 0) / competencyRatings.length)
      : 0;
  const overallScore = ROUND2(
    whatScore * ((cycle.whatWeight ?? 60) / 100) + howScore * ((cycle.howWeight ?? 40) / 100)
  );

  return {
    whatPct,
    whatScore,
    howScore,
    overallScore,
    nineBoxCell: computeNineBoxCell(whatPct, howScore),
  };
}

export function computeAnalytics(reviews) {
  const buckets = [1, 2, 3, 4, 5].map((score) => ({ score, count: 0, pct: 0 }));
  const scored = reviews.filter((r) => typeof r.overallScore === 'number');
  for (const r of scored) {
    const idx = Math.min(5, Math.max(1, Math.round(r.overallScore))) - 1;
    buckets[idx].count += 1;
  }
  const totalScored = scored.length;
  for (const b of buckets) {
    b.pct = totalScored > 0 ? Math.round((b.count / totalScored) * 100) : 0;
  }
  const orgAverageScore =
    totalScored > 0
      ? ROUND2(scored.reduce((acc, r) => acc + r.overallScore, 0) / totalScored)
      : 0;

  const byMgr = new Map();
  for (const r of scored) {
    if (!r.manager?.id) continue;
    if (!byMgr.has(r.manager.id)) byMgr.set(r.manager.id, []);
    byMgr.get(r.manager.id).push(r);
  }

  const biasAlerts = [];
  for (const [managerId, list] of byMgr.entries()) {
    if (list.length < 2) continue;
    const teamAvg = ROUND2(list.reduce((a, b) => a + b.overallScore, 0) / list.length);
    const delta = ROUND2(teamAvg - orgAverageScore);
    const topRatio = list.filter((r) => r.overallScore >= 4.6).length / list.length;
    const mgr = list[0].manager;
    if (delta >= 0.65 || topRatio >= 0.75) {
      biasAlerts.push({
        managerId,
        managerName: mgr.name,
        managerNameTh: mgr.nameTh,
        department: mgr.department,
        teamSize: list.length,
        teamAvg,
        orgAvg: orgAverageScore,
        delta,
        flagType: 'LENIENCY_BIAS',
        explanation: `Team avg (${teamAvg}) is +${delta} above org avg (${orgAverageScore}); ${Math.round(topRatio * 100)}% rated near 5.0.`,
        explanationTh: `ค่าเฉลี่ยทีม (${teamAvg}) สูงกว่าองค์กร (${orgAverageScore}) อยู่ +${delta} โดยมี ${Math.round(topRatio * 100)}% ได้คะแนนใกล้ 5.0`,
      });
    }
  }

  return { distribution: buckets, orgAverageScore, totalScored, biasAlerts };
}

/**
 * 1-Office-Unit Demo Dataset (16 Users):
 * 1 Super Admin | 2 HR Admins | 3 Managers | 6 Active Employees | 4 Pending New Employees
 */
export function createInitialClientState() {
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();

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
    rubricLevels: RUBRIC_LEVELS,
    competencies: COMPETENCIES,
  };

  const reviews = [
    {
      id: 'rev-nida',
      employeeId: 'usr-emp-nida',
      managerId: 'usr-mgr-eng',
      employee: { id: 'usr-emp-nida', name: 'Nida Phanich', nameTh: 'นิดา พาณิชย์', title: 'Senior Backend Engineer', department: 'Engineering' },
      manager: { id: 'usr-mgr-eng', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', department: 'Engineering' },
      status: 'PUBLISHED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-nida-1', round: 1, phase: 'GOAL', actorName: 'Nida Phanich', actorRole: 'EMPLOYEE', action: 'GOAL_SUBMITTED', comment: 'Proposed 2 high-impact payroll reliability OKRs (100% weight).', createdAt: daysAgo(20) },
        { id: 'cmt-nida-2', round: 1, phase: 'GOAL', actorName: 'Sarah Chen', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Strong stretch targets — approved with 1.2x & 1.1x multipliers.', createdAt: daysAgo(18) },
        { id: 'cmt-nida-3', round: 1, phase: 'CALIBRATION', actorName: 'Pluem Srisuk', actorRole: 'HR_ADMIN', action: 'CALIBRATION_LOCKED', comment: 'Calibrated & verified Star / High Performer placement.', createdAt: daysAgo(2) },
      ],
      isOverdue: false,
      daysOverdue: 0,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-nida-1', title: 'Cut payroll API p95 latency by 40%', titleTh: 'ลดเวลาตอบสนอง Payroll API (p95) ลง 40%', metricType: 'QUANTITATIVE', targetValue: '180', unit: 'ms (p95)', metric: 'p95 < 180ms', weight: 60, multiplier: 1.2, dueDate: '2026-10-31', actualValue: '145 ms', progressPct: 98 },
        { id: 'g-nida-2', title: 'Zero P1 incidents during year-end peak', titleTh: 'ไม่เกิดเหตุระบบล่มระดับ P1 ช่วงปิดงบปลายปี', metricType: 'QUANTITATIVE', targetValue: '0', unit: 'P1 outages', metric: '0 P1 outages', weight: 40, multiplier: 1.1, dueDate: '2026-12-15', actualValue: '0 outages', progressPct: 100 },
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
    },
    {
      id: 'rev-ton',
      employeeId: 'usr-emp-ton',
      managerId: 'usr-mgr-eng',
      employee: { id: 'usr-emp-ton', name: 'Tonrak Chaiyawat', nameTh: 'ต้นรัก ชัยวัฒน์', title: 'Frontend Engineer', department: 'Engineering' },
      manager: { id: 'usr-mgr-eng', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', department: 'Engineering' },
      status: 'SELF_REVIEW_SUBMITTED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-ton-1', round: 1, phase: 'GOAL', actorName: 'Sarah Chen', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Approved ESS mobile and regression targets.', createdAt: daysAgo(16) },
        { id: 'cmt-ton-2', round: 1, phase: 'REVIEW', actorName: 'Tonrak Chaiyawat', actorRole: 'EMPLOYEE', action: 'SELF_REVIEW_SUBMITTED', comment: 'Submitted Q4 actual achievements and self ratings.', createdAt: daysAgo(5) },
      ],
      isOverdue: true,
      daysOverdue: 2,
      missingActor: 'MANAGER',
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-ton-1', title: 'Ship responsive ESS mobile self-service', titleTh: 'ส่งมอบหน้าจอ ESS รองรับมือถือทุกขนาด', metricType: 'QUALITATIVE', targetValue: 'WCAG AA + 95', unit: 'Lighthouse', metric: 'Lighthouse >= 95', weight: 50, multiplier: 1.1, dueDate: '2026-10-15', actualValue: 'Lighthouse 96', progressPct: 86 },
        { id: 'g-ton-2', title: 'Reduce UI regression defects by 30%', titleTh: 'ลดบั๊กหน้าบ้านที่เกิดซ้ำลง 30%', metricType: 'QUANTITATIVE', targetValue: '30', unit: '% reduction', metric: '-30% bugs', weight: 50, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '24% reduction', progressPct: 78 },
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
    },
    {
      id: 'rev-may',
      employeeId: 'usr-emp-may',
      managerId: 'usr-mgr-sales',
      employee: { id: 'usr-emp-may', name: 'Mayuree Lim', nameTh: 'มยุรี ลิ้ม', title: 'Enterprise Account Executive', department: 'Sales' },
      manager: { id: 'usr-mgr-sales', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', department: 'Sales' },
      status: 'MANAGER_APPROVED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-may-1', round: 1, phase: 'GOAL', actorName: 'Somchai Wattana', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Enterprise ARR target 12M THB approved with 1.2x breakthrough multiplier.', createdAt: daysAgo(15) },
      ],
      isOverdue: false,
      daysOverdue: 0,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-may-1', title: 'Close 12M THB net-new enterprise ARR', titleTh: 'ปิดยอดขายลูกค้าองค์กรใหม่ 12 ล้านบาท', metricType: 'QUANTITATIVE', targetValue: '12', unit: 'M THB ARR', metric: '12M THB ARR', weight: 70, multiplier: 1.2, dueDate: '2026-12-20', actualValue: '12.6 M THB', progressPct: 96 },
        { id: 'g-may-2', title: 'Maintain renewal rate above 94%', titleTh: 'รักษาอัตราต่อสัญญาลูกค้าเดิมเกิน 94%', metricType: 'QUANTITATIVE', targetValue: '94', unit: '% GRR', metric: '>= 94% GRR', weight: 30, multiplier: 1.0, dueDate: '2026-12-20', actualValue: '95.2% GRR', progressPct: 95 },
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
    },
    {
      id: 'rev-art',
      employeeId: 'usr-emp-art',
      managerId: 'usr-mgr-sales',
      employee: { id: 'usr-emp-art', name: 'Arthit Kongkiat', nameTh: 'อาทิตย์ ก้องเกียรติ', title: 'Account Executive', department: 'Sales' },
      manager: { id: 'usr-mgr-sales', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', department: 'Sales' },
      status: 'MANAGER_APPROVED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-art-1', round: 1, phase: 'GOAL', actorName: 'Somchai Wattana', actorRole: 'MANAGER', action: 'GOAL_APPROVED', comment: 'Mid-market 8M THB quota approved.', createdAt: daysAgo(15) },
      ],
      isOverdue: false,
      daysOverdue: 0,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-art-1', title: 'Close 8M THB mid-market ARR', titleTh: 'ปิดยอดขายกลุ่ม Mid-Market 8 ล้านบาท', metricType: 'QUANTITATIVE', targetValue: '8', unit: 'M THB ARR', metric: '8M THB ARR', weight: 60, multiplier: 1.0, dueDate: '2026-12-20', actualValue: '5.9 M THB', progressPct: 74 },
        { id: 'g-art-2', title: 'Improve CRM pipeline hygiene to 95%', titleTh: 'อัปเดตข้อมูล Pipeline ใน CRM ครบ 95%', metricType: 'QUANTITATIVE', targetValue: '95', unit: '% complete', metric: '95% complete', weight: 40, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '70% complete', progressPct: 70 },
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
    },
    {
      id: 'rev-fah',
      employeeId: 'usr-emp-fah',
      managerId: 'usr-mgr-prod',
      employee: { id: 'usr-emp-fah', name: 'Fah Prapaporn', nameTh: 'ฟ้า ประภาพร', title: 'Product Designer', department: 'Product' },
      manager: { id: 'usr-mgr-prod', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', department: 'Product' },
      status: 'GOAL_REVISION_REQUIRED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-fah-1', round: 1, phase: 'GOAL', actorName: 'Fah Prapaporn', actorRole: 'EMPLOYEE', action: 'GOAL_SUBMITTED', comment: 'Proposed 2 annual UX OKRs totaling 100% weight.', createdAt: daysAgo(9) },
        { id: 'cmt-fah-2', round: 1, phase: 'GOAL', actorName: 'Kanya Rattanapong', actorRole: 'MANAGER', action: 'GOAL_REVISION_REQUESTED', comment: 'Good start! Please raise mobile UX target to SUS >= 88 (Stretch 1.1x) and add a 3rd KPI for WCAG accessibility coverage.', createdAt: daysAgo(7) },
      ],
      isOverdue: false,
      daysOverdue: 0,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-fah-1', title: 'Redesign Leave & Attendance mobile UX', titleTh: 'ออกแบบ UX ระบบลางานและลงเวลาบนมือถือใหม่', metricType: 'QUALITATIVE', targetValue: '85', unit: 'SUS Score', metric: 'SUS >= 85', weight: 50, multiplier: 1.1, dueDate: '2026-10-31', actualValue: '', progressPct: 0 },
        { id: 'g-fah-2', title: 'Unify design tokens across 4 HR modules', titleTh: 'รวม Design Tokens ให้เป็นมาตรฐานเดียวกัน 4 โมดูล', metricType: 'QUANTITATIVE', targetValue: '4', unit: 'HR modules', metric: '4/4 modules', weight: 50, multiplier: 1.0, dueDate: '2026-11-30', actualValue: '', progressPct: 0 },
      ],
      selfPayload: null,
      managerPayload: null,
    },
    {
      id: 'rev-nut',
      employeeId: 'usr-emp-nut',
      managerId: 'usr-mgr-prod',
      employee: { id: 'usr-emp-nut', name: 'Nattapong Meekul', nameTh: 'ณัฐพงศ์ มีกุล', title: 'Product Operations Analyst', department: 'Product' },
      manager: { id: 'usr-mgr-prod', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', department: 'Product' },
      status: 'CALIBRATION_LOCKED',
      revisionRound: 1,
      commentHistory: [
        { id: 'cmt-nut-1', round: 1, phase: 'CALIBRATION', actorName: 'Pluem Srisuk', actorRole: 'HR_ADMIN', action: 'CALIBRATION_LOCKED', comment: 'Cross-team calibration confirmed Needs Action tier with 90-day PIP support.', createdAt: daysAgo(1) },
      ],
      isOverdue: false,
      daysOverdue: 0,
      escalatedToSkipLevel: false,
      lastNudgedAt: null,
      extendedDeadline: null,
      goals: [
        { id: 'g-nut-1', title: 'Deliver monthly HR analytics packs on time', titleTh: 'ส่งมอบรายงานวิเคราะห์ข้อมูล HR รายเดือนตรงเวลา', metricType: 'QUANTITATIVE', targetValue: '12', unit: 'packs/year', metric: '12/12 on time', weight: 60, multiplier: 1.0, dueDate: '2026-12-15', actualValue: '6/12 packs', progressPct: 45 },
        { id: 'g-nut-2', title: 'Resolve customer data import tickets < 24h', titleTh: 'แก้ปัญหาไฟล์นำเข้าข้อมูลลูกค้าภายใน 24 ชม.', metricType: 'QUANTITATIVE', targetValue: '90', unit: '% SLA', metric: 'SLA >= 90%', weight: 40, multiplier: 1.0, dueDate: '2026-12-15', actualValue: '68% SLA', progressPct: 50 },
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
        managerSummary: 'Performance fell below role expectations across delivery reliability and SLA.',
        developmentFocus: '90-day structured Performance Improvement Plan (PIP) with weekly check-ins and SQL automation coaching.',
      },
    },
  ].map((r) => {
    if (!r.managerPayload) {
      return { ...r, whatPct: null, whatScore: null, howScore: null, overallScore: null, nineBoxCell: null };
    }
    const scores = computeScoresClient({
      goals: r.goals,
      goalRatings: r.managerPayload.goalRatings,
      competencyRatings: r.managerPayload.competencyRatings,
      cycle,
    });
    return { ...r, ...scores };
  });

  const auditLogs = [
    {
      id: 'aud-1',
      action: 'PUBLISH',
      actorName: 'Pluem Srisuk',
      reason: 'Early pilot verification completed for Engineering senior review.',
      createdAt: daysAgo(1),
    },
  ];

  // Exact 16-User 1-Office-Unit Roster:
  // 1 Super Admin + 2 HR Admins + 3 Managers + 6 Active Employees + 4 Pending New Employees
  const users = [
    // 1 Super Admin
    { id: 'usr-super', employeeCode: 'EMP-0001', name: 'Kritnarin P.', nameTh: 'กฤตนรินทร์ พ.', title: 'System Super Administrator', department: 'IT & Governance', role: 'SUPER_ADMIN', accountStatus: 'ACTIVE' },
    // 2 HR Admins
    { id: 'usr-hr', employeeCode: 'EMP-1001', name: 'Pluem Srisuk', nameTh: 'ปลื้ม ศรีสุข', title: 'People Operations Lead', department: 'Human Resources', role: 'HR_ADMIN', accountStatus: 'ACTIVE' },
    { id: 'usr-hr-2', employeeCode: 'EMP-1002', name: 'Siriporn Kamol', nameTh: 'ศิริพร กมล', title: 'HR Business Partner', department: 'Human Resources', role: 'HR_ADMIN', accountStatus: 'ACTIVE' },
    // 3 Managers
    { id: 'usr-mgr-eng', employeeCode: 'EMP-2001', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', title: 'Engineering Manager', department: 'Engineering', role: 'MANAGER', accountStatus: 'ACTIVE' },
    { id: 'usr-mgr-sales', employeeCode: 'EMP-2002', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', title: 'Enterprise Sales Director', department: 'Sales', role: 'MANAGER', accountStatus: 'ACTIVE' },
    { id: 'usr-mgr-prod', employeeCode: 'EMP-2003', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', title: 'Head of Product', department: 'Product', role: 'MANAGER', accountStatus: 'ACTIVE' },
    // 6 Active Employees
    { id: 'usr-emp-nida', employeeCode: 'EMP-3001', name: 'Nida Phanich', nameTh: 'นิดา พาณิชย์', title: 'Senior Backend Engineer', department: 'Engineering', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    { id: 'usr-emp-ton', employeeCode: 'EMP-3002', name: 'Tonrak Chaiyawat', nameTh: 'ต้นรัก ชัยวัฒน์', title: 'Frontend Engineer', department: 'Engineering', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    { id: 'usr-emp-may', employeeCode: 'EMP-3003', name: 'Mayuree Lim', nameTh: 'มยุรี ลิ้ม', title: 'Enterprise Account Executive', department: 'Sales', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    { id: 'usr-emp-art', employeeCode: 'EMP-3004', name: 'Arthit Kongkiat', nameTh: 'อาทิตย์ ก้องเกียรติ', title: 'Account Executive', department: 'Sales', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    { id: 'usr-emp-fah', employeeCode: 'EMP-3005', name: 'Fah Prapaporn', nameTh: 'ฟ้า ประภาพร', title: 'Product Designer', department: 'Product', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    { id: 'usr-emp-nut', employeeCode: 'EMP-3006', name: 'Nattapong Meekul', nameTh: 'ณัฐพงศ์ มีกุล', title: 'Product Operations Analyst', department: 'Product', role: 'EMPLOYEE', accountStatus: 'ACTIVE' },
    // 4 New Employees Pending Super Admin Approval (can be approved as HR_ADMIN, MANAGER, or EMPLOYEE)
    { id: 'usr-new-1', employeeCode: 'EMP-3091', name: 'Pimchanok Darunee', nameTh: 'พิมพ์ชนก ดรุณี', title: 'Junior Data Analyst', department: 'Operations', role: 'EMPLOYEE', accountStatus: 'PENDING_APPROVAL' },
    { id: 'usr-new-2', employeeCode: 'EMP-3092', name: 'Tanapol Worawit', nameTh: 'ธนพล วรวิทย์', title: 'People & Culture Specialist', department: 'Human Resources', role: 'HR_ADMIN', accountStatus: 'PENDING_APPROVAL' },
    { id: 'usr-new-3', employeeCode: 'EMP-3093', name: 'Chanya Suthida', nameTh: 'ชัญญา สุธิดา', title: 'Engineering Squad Lead', department: 'Engineering', role: 'MANAGER', accountStatus: 'PENDING_APPROVAL' },
    { id: 'usr-new-4', employeeCode: 'EMP-3094', name: 'Warut Kittipong', nameTh: 'วรุตม์ กิตติพงศ์', title: 'Sales Representative', department: 'Sales', role: 'EMPLOYEE', accountStatus: 'PENDING_APPROVAL' },
  ];

  const rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS);

  return { cycle, reviews, auditLogs, users, rolePermissions };
}
