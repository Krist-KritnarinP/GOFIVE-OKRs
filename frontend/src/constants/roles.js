export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const JOB_LEVELS = [
  { id: 'L1_JUNIOR', short: 'L1', label: 'L1 Junior', labelTh: 'L1 ระดับต้น', tone: 'neutral' },
  { id: 'L2_MID', short: 'L2', label: 'L2 Mid', labelTh: 'L2 ระดับกลาง', tone: 'track' },
  { id: 'L3_SENIOR', short: 'L3', label: 'L3 Senior', labelTh: 'L3 ระดับอาวุโส', tone: 'indigo' },
  { id: 'L4_LEAD', short: 'L4', label: 'L4 Lead', labelTh: 'L4 หัวหน้าทีม', tone: 'high' },
];

export const DEMO_PERSONAS = [
  {
    role: ROLES.SUPER_ADMIN,
    userId: 'usr-super',
    employeeCode: 'EMP-0001',
    label: 'Super Admin',
    labelTh: 'ผู้ดูแลระบบสูงสุด',
    name: 'Kritnarin P.',
    nameTh: 'กฤตนรินทร์ พ.',
    department: 'IT & Governance',
  },
  {
    role: ROLES.HR_ADMIN,
    userId: 'usr-hr',
    employeeCode: 'EMP-1001',
    label: 'HR Admin',
    labelTh: 'ฝ่ายบุคคล (HR)',
    name: 'Pluem Srisuk',
    nameTh: 'ปลื้ม ศรีสุข',
    department: 'Human Resources',
  },
  {
    role: ROLES.MANAGER,
    userId: 'usr-mgr-eng',
    employeeCode: 'EMP-2001',
    label: 'Manager',
    labelTh: 'หัวหน้าทีม',
    name: 'Sarah Chen',
    nameTh: 'ซาร่า เฉิน',
    department: 'Engineering',
  },
  {
    role: ROLES.EMPLOYEE,
    userId: 'usr-emp-nida',
    employeeCode: 'EMP-3001',
    label: 'Employee',
    labelTh: 'พนักงาน',
    name: 'Nida Phanich',
    nameTh: 'นิดา พาณิชย์',
    department: 'Engineering',
  },
];

export const PERMISSION_CATALOG = [
  { key: 'rbac:manage', label: 'Manage Roles & Approvals', labelTh: 'กำหนดสิทธิ์แต่ละตำแหน่งและอนุมัติบัญชี' },
  { key: 'cycle:configure', label: 'Configure Cycle / Stage Dates / Lock', labelTh: 'ตั้งค่ารอบประเมิน / เส้นตายแต่ละช่วง / ปิดรอบ' },
  { key: 'analytics:view_org', label: 'View Impact & Competency Map & Bias Alerts', labelTh: 'ดูแผนผังผลลัพธ์และสมรรถนะ และแจ้งเตือนอคติ' },
  { key: 'exception:manage', label: 'Manage SLA & HRBP Interventions', labelTh: 'จัดการเคสเลย SLA และคอมเมนต์ช่วยไกล่เกลี่ย' },
  { key: 'review:publish', label: 'HR Approve & Publish Results', labelTh: 'อนุมัติและประกาศผลประเมินให้พนักงานเห็น' },
  { key: 'team:evaluate', label: 'Review OKRs & Evaluate Direct Reports', labelTh: 'อนุมัติ OKR และประเมินผลงานลูกทีม' },
  { key: 'self:submit', label: 'Manage Own OKRs & Self-Review', labelTh: 'ตั้ง OKR ของตัวเองและส่งประเมินตนเอง' },
  { key: 'audit:view', label: 'View Governance Activity Log', labelTh: 'ดูประวัติกิจกรรม (Activity Log)' },
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

export const EMPLOYEE_DEMO_SWITCHES = [
  { userId: 'usr-emp-fah', employeeCode: 'EMP-3005', name: 'Fah Prapaporn', nameTh: 'ฟ้า ประภาพร', tag: 'Revision Round 2', tagTh: 'ปรับปรุงรอบที่ 2' },
  { userId: 'usr-emp-nida', employeeCode: 'EMP-3001', name: 'Nida Phanich', nameTh: 'นิดา พาณิชย์', tag: 'Published Early', tagTh: 'ประกาศผลแล้ว' },
  { userId: 'usr-emp-nut', employeeCode: 'EMP-3006', name: 'Nattapong Meekul', nameTh: 'ณัฐพงศ์ มีกุล', tag: 'Pending HR Publish', tagTh: 'รอ HR อนุมัติประกาศ' },
  { userId: 'usr-emp-ton', employeeCode: 'EMP-3002', name: 'Tonrak Chaiyawat', nameTh: 'ต้นรัก ชัยวัฒน์', tag: 'Pending Manager', tagTh: 'รอหัวหน้าประเมิน' },
];

export const MANAGER_DEMO_SWITCHES = [
  { userId: 'usr-mgr-eng', employeeCode: 'EMP-2001', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', dept: 'Engineering', tag: '1 SLA Overdue', tagTh: 'เลย SLA 1 คน' },
  { userId: 'usr-mgr-sales', employeeCode: 'EMP-2002', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', dept: 'Sales', tag: 'Bias Alert', tagTh: 'แจ้งเตือนคะแนนสูง' },
  { userId: 'usr-mgr-prod', employeeCode: 'EMP-2003', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', dept: 'Product', tag: 'OKR Revisions', tagTh: 'รอปรับปรุง OKR' },
];
