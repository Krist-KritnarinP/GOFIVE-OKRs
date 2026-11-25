/**
 * Department Starter OKR Templates — supports every department & work style
 * (Numeric, Milestone Checklist, and Service/Quality Standard) so employees
 * can draft clear OKRs in under 5 minutes without training.
 */
export const STARTER_DEPARTMENTS = [
  {
    id: 'Operations',
    label: 'Operations / Admin / Finance',
    labelTh: 'ธุรการ บัญชี และปฏิบัติการ',
    tone: 'warn',
    templates: [
      {
        title: 'Deliver all 12 monthly operational & budget reports on time',
        titleTh: 'ส่งรายงานปฏิบัติการหรืองบประจำเดือนตรงเวลาครบ 12 รอบ',
        metricType: 'MILESTONE',
        targetValue: '12',
        unit: 'monthly reports',
        unitTh: 'ฉบับ/ปี',
        weight: 50,
        multiplier: 1.0,
      },
      {
        title: 'Keep document & billing error rate below 2%',
        titleTh: 'ควบคุมข้อผิดพลาดด้านเอกสารหรือการวางบิลให้ต่ำกว่า 2%',
        metricType: 'QUANTITATIVE',
        targetValue: '< 2',
        unit: '% error rate',
        unitTh: '% ข้อผิดพลาด',
        weight: 30,
        multiplier: 1.0,
      },
      {
        title: 'Maintain internal stakeholder service satisfaction >= 4.5/5',
        titleTh: 'รักษาคะแนนความพึงพอใจของผู้รับบริการภายในตั้งแต่ 4.5/5',
        metricType: 'QUALITATIVE',
        targetValue: '4.5',
        unit: '/ 5 score',
        unitTh: '/ 5 คะแนน',
        weight: 20,
        multiplier: 1.0,
      },
    ],
  },
  {
    id: 'Sales',
    label: 'Sales & Marketing',
    labelTh: 'ฝ่ายขายและการตลาด',
    tone: 'high',
    templates: [
      {
        title: 'Achieve annual net-new revenue target',
        titleTh: 'ปิดยอดขายลูกค้าใหม่ให้ได้ตามเป้าหมายประจำปี',
        metricType: 'QUANTITATIVE',
        targetValue: '10',
        unit: 'M THB',
        unitTh: 'ล้านบาท',
        weight: 50,
        multiplier: 1.1,
      },
      {
        title: 'Maintain existing client renewal rate >= 92%',
        titleTh: 'รักษาอัตราต่อสัญญาลูกค้าเดิมตั้งแต่ 92% ขึ้นไป',
        metricType: 'QUANTITATIVE',
        targetValue: '92',
        unit: '% renewal',
        unitTh: '% ต่อสัญญา',
        weight: 30,
        multiplier: 1.0,
      },
      {
        title: 'Keep CRM pipeline updated every Friday across all active deals',
        titleTh: 'อัปเดตข้อมูลลูกค้าในระบบครบถ้วนทุกสัปดาห์',
        metricType: 'MILESTONE',
        targetValue: '48',
        unit: 'weekly updates',
        unitTh: 'สัปดาห์',
        weight: 20,
        multiplier: 1.0,
      },
    ],
  },
  {
    id: 'Customer Support',
    label: 'Customer Support & Service',
    labelTh: 'บริการลูกค้า',
    tone: 'track',
    templates: [
      {
        title: 'Resolve >= 95% of customer cases within SLA window',
        titleTh: 'แก้ไขเคสลูกค้าให้เสร็จภายในกำหนด SLA อย่างน้อย 95%',
        metricType: 'QUANTITATIVE',
        targetValue: '95',
        unit: '% SLA',
        unitTh: '% ตรงเวลา',
        weight: 50,
        multiplier: 1.0,
      },
      {
        title: 'Maintain customer satisfaction (CSAT) >= 4.6/5',
        titleTh: 'รักษาคะแนนความพึงพอใจลูกค้า (CSAT) ตั้งแต่ 4.6/5',
        metricType: 'QUALITATIVE',
        targetValue: '4.6',
        unit: '/ 5 CSAT',
        unitTh: '/ 5 คะแนน',
        weight: 30,
        multiplier: 1.1,
      },
      {
        title: 'Publish 10 reusable FAQ & troubleshooting guides',
        titleTh: 'จัดทำคู่มือคำถามที่พบบ่อย (FAQ) เพื่อลดเคสซ้ำ 10 เรื่อง',
        metricType: 'MILESTONE',
        targetValue: '10',
        unit: 'FAQ guides',
        unitTh: 'คู่มือ',
        weight: 20,
        multiplier: 1.0,
      },
    ],
  },
  {
    id: 'Human Resources',
    label: 'Human Resources',
    labelTh: 'ฝ่ายบุคคล (HR)',
    tone: 'indigo',
    templates: [
      {
        title: 'Complete onboarding checklist for 100% of new hires within week 1',
        titleTh: 'ดูแลการปฐมนิเทศพนักงานใหม่ครบตามเช็กลิสต์ 100% ในสัปดาห์แรก',
        metricType: 'MILESTONE',
        targetValue: '100',
        unit: '% on-time onboarding',
        unitTh: '% ครบตามแผน',
        weight: 50,
        multiplier: 1.0,
      },
      {
        title: 'Fill priority open roles within 45 days average',
        titleTh: 'สรรหาตำแหน่งสำคัญได้ครบภายในเฉลี่ย 45 วัน',
        metricType: 'QUANTITATIVE',
        targetValue: '45',
        unit: 'days avg',
        unitTh: 'วัน (เฉลี่ย)',
        weight: 30,
        multiplier: 1.1,
      },
      {
        title: 'Employee HR service & fairness pulse score >= 4.3/5',
        titleTh: 'คะแนนความพึงพอใจพนักงานต่อบริการ HR ตั้งแต่ 4.3/5',
        metricType: 'QUALITATIVE',
        targetValue: '4.3',
        unit: '/ 5 pulse',
        unitTh: '/ 5 คะแนน',
        weight: 20,
        multiplier: 1.0,
      },
    ],
  },
  {
    id: 'Product',
    label: 'Product & Design',
    labelTh: 'โปรดักต์และดีไซน์',
    tone: 'indigo',
    templates: [
      {
        title: 'Improve core workflow usability score (SUS) >= 85',
        titleTh: 'ยกระดับความง่ายในการใช้งานหน้าจอหลักให้ได้คะแนน SUS >= 85',
        metricType: 'QUALITATIVE',
        targetValue: '85',
        unit: 'SUS Score',
        unitTh: 'คะแนน SUS',
        weight: 50,
        multiplier: 1.1,
      },
      {
        title: 'Deliver 4 major product roadmap milestones on schedule',
        titleTh: 'ส่งมอบฟีเจอร์หลักตามแผนงานครบ 4 รอบตรงเวลา',
        metricType: 'MILESTONE',
        targetValue: '4',
        unit: 'milestones',
        unitTh: 'รอบส่งมอบ',
        weight: 30,
        multiplier: 1.0,
      },
      {
        title: 'Cut user task completion time on primary workflow by 30%',
        titleTh: 'ลดเวลาที่ผู้ใช้ทำรายการหลักบนระบบลง 30%',
        metricType: 'QUANTITATIVE',
        targetValue: '30',
        unit: '% faster',
        unitTh: '% เร็วขึ้น',
        weight: 20,
        multiplier: 1.1,
      },
    ],
  },
  {
    id: 'Engineering',
    label: 'Engineering & IT',
    labelTh: 'ไอทีและวิศวกรรม',
    tone: 'track',
    templates: [
      {
        title: 'Maintain core service availability >= 99.9% with zero P1 outages',
        titleTh: 'รักษาความเสถียรของระบบหลัก >= 99.9% และไม่มีเหตุล่มระดับ P1',
        metricType: 'QUANTITATIVE',
        targetValue: '99.9',
        unit: '% uptime',
        unitTh: '% เสถียรภาพ',
        weight: 50,
        multiplier: 1.1,
      },
      {
        title: 'Ship planned security & accessibility upgrade milestones',
        titleTh: 'ส่งมอบแผนอัปเกรดความปลอดภัยและมาตรฐานการเข้าถึงครบตามกำหนด',
        metricType: 'MILESTONE',
        targetValue: '4',
        unit: 'milestones',
        unitTh: 'โครงการย่อย',
        weight: 30,
        multiplier: 1.0,
      },
      {
        title: 'Reduce recurring production bug tickets by 30%',
        titleTh: 'ลดจำนวนเคสบั๊กที่เกิดซ้ำบนระบบจริงลง 30%',
        metricType: 'QUANTITATIVE',
        targetValue: '30',
        unit: '% fewer bugs',
        unitTh: '% ลดบั๊ก',
        weight: 20,
        multiplier: 1.0,
      },
    ],
  },
];

/**
 * Resolve best default department tab for an employee.
 */
export function resolveStarterDepartmentId(department = '') {
  const normalized = String(department).toLowerCase();
  if (normalized.includes('sales') || normalized.includes('market')) return 'Sales';
  if (normalized.includes('support') || normalized.includes('service') || normalized.includes('cs')) {
    return 'Customer Support';
  }
  if (normalized.includes('human') || normalized.includes('hr')) return 'Human Resources';
  if (normalized.includes('product') || normalized.includes('design')) return 'Product';
  if (normalized.includes('eng') || normalized.includes('it') || normalized.includes('tech')) {
    return 'Engineering';
  }
  return 'Operations';
}

/**
 * Proportionally rebalance an array of goals/edits so total weight === 100
 * with clean 5%-step multiples whenever possible (and always exact sum = 100).
 */
export function autoBalanceWeights(items = []) {
  const n = items.length;
  if (n === 0) return [];
  if (n === 1) return [{ ...items[0], weight: 100 }];

  const rawSum = items.reduce((acc, item) => acc + Math.max(0, Number(item.weight || 0)), 0);
  const weights = items.map((item) => {
    const share = rawSum > 0 ? (Math.max(0, Number(item.weight || 0)) / rawSum) * 100 : 100 / n;
    return Math.max(5, Math.round(share / 5) * 5);
  });

  // Adjust remainder in 5-point increments (or 1-point if >20 goals) so total === 100 exactly
  const step = n <= 20 ? 5 : 1;
  let diff = 100 - weights.reduce((a, b) => a + b, 0);

  let guard = 0;
  while (diff !== 0 && guard < 200) {
    guard += 1;
    if (diff > 0) {
      // Add to the highest-priority (first) item(s)
      const delta = Math.min(step, diff);
      weights[(guard - 1) % n] += delta;
      diff -= delta;
    } else {
      // Subtract from the largest weight that stays >= 5
      let maxIdx = -1;
      let maxVal = 5;
      for (let i = 0; i < n; i += 1) {
        if (weights[i] > maxVal) {
          maxVal = weights[i];
          maxIdx = i;
        }
      }
      if (maxIdx === -1) break;
      const delta = Math.min(step, Math.abs(diff), weights[maxIdx] - 5);
      if (delta <= 0) break;
      weights[maxIdx] -= delta;
      diff += delta;
    }
  }

  return items.map((item, idx) => ({ ...item, weight: weights[idx] }));
}
