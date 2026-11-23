export const ROLES = {
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const DEMO_PERSONAS = [
  {
    role: ROLES.HR_ADMIN,
    userId: 'usr-hr',
    label: 'HR Admin',
    labelTh: 'ฝ่ายบุคคล (HR)',
    name: 'Pluem Srisuk',
    nameTh: 'ปลื้ม ศรีสุข',
    department: 'Human Resources',
  },
  {
    role: ROLES.MANAGER,
    userId: 'usr-mgr-eng',
    label: 'Manager',
    labelTh: 'หัวหน้าทีม',
    name: 'Sarah Chen',
    nameTh: 'ซาร่า เฉิน',
    department: 'Engineering',
  },
  {
    role: ROLES.EMPLOYEE,
    userId: 'usr-emp-nida',
    label: 'Employee',
    labelTh: 'พนักงาน',
    name: 'Nida Phanich',
    nameTh: 'นิดา พาณิชย์',
    department: 'Engineering',
  },
];

export const EMPLOYEE_DEMO_SWITCHES = [
  { userId: 'usr-emp-nida', name: 'Nida Phanich', nameTh: 'นิดา พาณิชย์', tag: 'Published Star', tagTh: 'ประกาศผลแล้ว' },
  { userId: 'usr-emp-fah', name: 'Fah Prapaporn', nameTh: 'ฟ้า ประภาพร', tag: 'Locked (Pending HR)', tagTh: 'รอฝ่ายบุคคลประกาศ' },
  { userId: 'usr-emp-bank', name: 'Bank Jiraporn', nameTh: 'แบงค์ จิราพร', tag: 'Overdue Draft', tagTh: 'เลยกำหนดส่ง' },
];

export const MANAGER_DEMO_SWITCHES = [
  { userId: 'usr-mgr-eng', name: 'Sarah Chen', nameTh: 'ซาร่า เฉิน', dept: 'Engineering', tag: '1 Overdue', tagTh: 'ค้างประเมิน 1 คน' },
  { userId: 'usr-mgr-sales', name: 'Somchai Wattana', nameTh: 'สมชาย วัฒนา', dept: 'Sales', tag: 'Bias Alert', tagTh: 'แจ้งเตือนคะแนนสูง' },
  { userId: 'usr-mgr-prod', name: 'Kanya Rattanapong', nameTh: 'กัญญา รัตนพงศ์', dept: 'Product', tag: 'Balanced', tagTh: 'สมดุล' },
];
