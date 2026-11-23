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

// Ordered top-row (High Y) to bottom-row (Low Y), left (Low X) to right (High X)
export const NINE_BOX_CELLS = [
  {
    id: 'HIGH_POTENTIAL_EMERGING',
    label: 'High Potential',
    labelTh: 'ศักยภาพสูง (กำลังเติบโต)',
    xLabel: 'Goal < 65%',
    yLabel: 'Comp >= 4.0',
    tone: 'track',
  },
  {
    id: 'HIGH_IMPACT_GROWTH',
    label: 'High Impact',
    labelTh: 'สร้างผลลัพธ์สูง',
    xLabel: 'Goal 65–89%',
    yLabel: 'Comp >= 4.0',
    tone: 'high',
  },
  {
    id: 'STAR_HIGH_PERFORMER',
    label: 'Star / High Performer',
    labelTh: 'พนักงานผลงานโดดเด่น',
    xLabel: 'Goal >= 90%',
    yLabel: 'Comp >= 4.0',
    tone: 'high',
  },
  {
    id: 'DEVELOPING_TALENT',
    label: 'Developing',
    labelTh: 'กำลังพัฒนาทักษะ',
    xLabel: 'Goal < 65%',
    yLabel: 'Comp 2.6–3.9',
    tone: 'warn',
  },
  {
    id: 'CORE_PERFORMER',
    label: 'Core Performer',
    labelTh: 'กำลังหลักของทีม',
    xLabel: 'Goal 65–89%',
    yLabel: 'Comp 2.6–3.9',
    tone: 'track',
  },
  {
    id: 'CONSISTENT_CONTRIBUTOR',
    label: 'Strong Contributor',
    labelTh: 'ส่งมอบงานสม่ำเสมอ',
    xLabel: 'Goal >= 90%',
    yLabel: 'Comp 2.6–3.9',
    tone: 'track',
  },
  {
    id: 'NEEDS_ACTION_LOW_PERFORMER',
    label: 'Needs Action',
    labelTh: 'ต้องดูแลและพัฒนาเร่งด่วน',
    xLabel: 'Goal < 65%',
    yLabel: 'Comp < 2.6',
    tone: 'low',
  },
  {
    id: 'INCONSISTENT_PERFORMER',
    label: 'Inconsistent',
    labelTh: 'ผลงานยังไม่นิ่ง',
    xLabel: 'Goal 65–89%',
    yLabel: 'Comp < 2.6',
    tone: 'warn',
  },
  {
    id: 'EFFECTIVE_SPECIALIST',
    label: 'Specialist (Coach Behavior)',
    labelTh: 'เก่งงาน (ต้องเสริมพฤติกรรม)',
    xLabel: 'Goal >= 90%',
    yLabel: 'Comp < 2.6',
    tone: 'warn',
  },
];
