import {
  integer,
  text,
  pgTable,
  varchar,
  decimal,
  pgEnum,
  uuid,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";

export const leaveTypeEnum = pgEnum("leave_type", [
  "First Half",
  "Second Half",
  "Full Day",
]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const departmentEnum = pgEnum("department", ["cs", "mechanical"]);
export const rolesTable = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull().unique(),
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
  address: varchar("address"),
  department: departmentEnum("department"),
  roleId: integer("role_id").references(() => rolesTable.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  sessionToken: varchar("session_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const leaveRequestsTable = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  requestToId: uuid("request_to_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  reason: text("reason").notNull(),
  status: statusEnum("status").default("pending"),
  approvedBy: uuid("approved_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const userLeavesTable = pgTable("user_leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  totalLeave: integer("total_leave").notNull().default(20),
  availableLeave: integer("available_leave").notNull().default(20),
  usedLeave: integer("used_leave").default(0).notNull(),
  academicYear: varchar("academic_year").notNull(),
  totalWorkingDays: integer("total_working_days").default(200),
  attendancePercentage: decimal("attendance_percentage")
    .notNull()
    .default("100.0"),
  ...timestamps,
});
