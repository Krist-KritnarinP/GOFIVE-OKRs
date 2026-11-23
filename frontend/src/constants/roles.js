export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

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
  { key: 'cycle:configure', label: 'Configure Cycle / Grace / Lock', labelTh: 'ตั้งค่ารอบประเมิน / ผ่อนผัน / ปิดรอบ' },
  { key: 'analytics:view_org', label: 'View Org 9-Box & Bias Alerts', labelTh: 'ดู 9-Box และแจ้งเตือนอคติทั้งองค์กร' },
  { key: 'exception:manage', label: 'Manage Overdue Exceptions', labelTh: 'ติดตาม/ขยายเวลา/ส่งต่อเคสเลยกำหนด' },
  { key: 'review:publish', label: 'Publish Results to Employees', labelTh: 'ประกาศผลประเมินให้พนักงานเห็น' },
  { key: 'team:evaluate', label: 'Evaluate Direct Reports', labelTh: 'ประเมินผลงานลูกทีมในสายบังคับบัญชา' },
  { key: 'self:submit', label: 'View Own Goals & Self-Review', labelTh: 'ดู KPI ของตัวเองและส่งประเมินตนเอง' },
  { key: 'audit:view', label: 'View Governance Audit Log', labelTh: 'ดูประวัติการดำเนินการ (Audit Log)' },
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
  { userId: 'usr-emp-nida', employeeCode: 'EMP-3001', name: 'Nida Phanich', nameTh: 'นิดา พาณิชย์', tag: 'Published Star', tagTh: 'ประกาศผลแล้ว' },
  { userId: 'usr-emp-fah', employeeCode: 'EMP-3007', name: 'Fah Prapaporn', nameTh: 'ฟ้า ประภาพร', tag: 'Locked · Pending HR', tagTh: 'รอฝ่ายบุคคลประกาศ' },
  { userId: 'usr-emp-bank', employeeCode: 'EMP-3003', name: 'Bank Jiraporn', nameTh: 'แบงค์ จิราพร', tag: 'Overdue Draft', tagTh: 'เลยกำหนดส่ง' },
];

export const MANAGER_DEMO_SWITCHES = [
  { userId: 'usr-mgr-eng', employeeCode: 'EMP-2001', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', dept: 'Engineering', tag: '1 Overdue', tagTh: 'ค้างประเมิน 1 คน' },
  { userId: 'usr-mgr-sales', employeeCode: 'EMP-2002', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', dept: 'Sales', tag: 'Bias Alert', tagTh: 'แจ้งเตือนคะแนนสูง' },
  { userId: 'usr-mgr-prod', employeeCode: 'EMP-2003', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', dept: 'Product', tag: 'Balanced', tagTh: 'สมดุล' },
];
