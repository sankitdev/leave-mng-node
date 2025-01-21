import { z } from "zod";
const timestampSchema = z.coerce.date();
const leaveTypeEnum = z.enum(["first_half", "second_half", "full_day"]);
const statusEnum = z.enum(["pending", "approved", "rejected"]);
const genderEnum = z.enum(["male", "female"]);
const departmentEnum = z.enum(["cs", "mechanical"]);
export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
  gender: genderEnum,
  image: z.string().url(),
  phone: z
    .string()
    .min(10, "Phone number should be at least 10 characters long"),
  address: z.string().optional(),
  department: departmentEnum,
  roleId: z.number().optional(),
});

export const leaveRequestSchema = z
  .object({
    userId: z.string().uuid(),
    startDate: timestampSchema,
    endDate: timestampSchema,
    requestToId: z.string().uuid(),
    leaveType: leaveTypeEnum,
    reason: z.string().min(1, "Reason is required"),
    status: statusEnum,
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
