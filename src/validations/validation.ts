import { z } from "zod";
const timestampSchema = z.string().refine(
  (date) => {
    const inputDate = new Date(date);
    const today = new Date();

    // Normalize time to 00:00:00 for accurate comparison
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today;
  },
  { message: "Date must be today or a future date" }
);
const leaveTypeEnum = z.enum(["First Half", "Second Half", "Full Day"]);
const statusEnum = z.enum(["pending", "approved", "rejected"]);
const leaveStatusEnum = z.enum(["approved", "rejected"]);
const genderEnum = z.enum(["male", "female"]);
const departmentEnum = z.enum(["cs", "mechanical"]);
export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
  gender: genderEnum,
  image: z.string(),
  phone: z
    .string()
    .min(10, "Phone number should be at least 10 characters long"),
  address: z.string().optional(),
  department: departmentEnum,
  roleId: z.number().optional(),
});

export const leaveRequestSchema = z
  .object({
    userId: z.string().uuid().optional(),
    startDate: timestampSchema,
    endDate: timestampSchema,
    requestToId: z.string().uuid(),
    leaveType: leaveTypeEnum,
    reason: z.string().min(1, "Reason is required"),
    status: statusEnum.default("pending"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be same as or after the start date",
    path: ["endDate"],
  });

export const userLeavesSchema = z
  .object({
    userId: z.string().uuid(),
    totalLeave: z.number().int().positive(),
    availableLeave: z.number().int().min(0),
    usedLeave: z.number().int().min(0),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/),
    totalWorkingDays: z.number().int().positive(),
    attendancePercentage: z.number().min(0).max(100),
  })
  .refine(
    (data) => data.totalLeave >= data.usedLeave + data.availableLeave,
    "Total leave must be greater than or equal to used + available leave"
  );

export const studentLeaveApprove = z.object({
  status: leaveStatusEnum,
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number should be at least 10 characters long")
    .optional(),
  department: departmentEnum,
});
