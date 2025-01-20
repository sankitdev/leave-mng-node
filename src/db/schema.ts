import {
  integer,
  text,
  timestamp,
  pgTable,
  varchar,
  decimal,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";

export const leaveTypeEnum = pgEnum("leave_type", [
  "First half",
  "Second half",
  "Full day",
]);
export const statusEnum = pgEnum("status", ["Pending", "Approved", "Rejected"]);
export const genderEnum = pgEnum("gender", ["Male", "Female"]);

export const rolesTable = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  priority: integer("priority").notNull(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  gender: genderEnum("gender").notNull(),
  image: varchar("image").notNull(),
  phone: varchar("phone").notNull(),
  address: varchar("address").notNull(),
  department: varchar("department"),
  roleId: integer("role_id").references(() => rolesTable.id),
  ...timestamps,
});

export const leaveRequestsTable = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => usersTable.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  requestToId: integer("request_to_id").references(() => usersTable.id),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  reason: text("reason").notNull(),
  status: statusEnum("status").default("Pending"),
  ...timestamps,
});

export const userLeavesTable = pgTable("user_leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => usersTable.id),
  totalLeave: integer("total_leave").notNull(),
  availableLeave: integer("available_leave").notNull(),
  usedLeave: integer("used_leave").notNull(),
  academicYear: varchar("academic_year").notNull(),
  totalWorkingDays: integer("total_working_days").notNull(),
  attendancePercentage: decimal("attendance_percentage").notNull(),
  ...timestamps,
});
