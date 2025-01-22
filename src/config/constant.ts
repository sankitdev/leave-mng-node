export const roles = [
  { name: "admin", priority: 1 },
  { name: "hod", priority: 2 },
  { name: "staff", priority: 3 },
  { name: "student", priority: 4 },
];

export const student = {
  totalLeave: 20,
  availableLeave: 20,
  usedLeave: 0,
  academicYear: new Date().getFullYear(),
  totalWorkingDays: 220,
  attendancePercentage: 100,
};
