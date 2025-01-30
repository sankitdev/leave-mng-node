import { hash } from "bcrypt";
import { db } from "../db";
import { leaveRequestsTable, userLeavesTable, usersTable } from "../db/schema";
import { updateUserSchema, userSchema } from "./../validations/validation";
import { Request, Response } from "express";
import { roles } from "../config/constant";
import { count, eq } from "drizzle-orm";
import { Role } from "../types/types";
import { alias } from "drizzle-orm/pg-core";
export const addUser = async (req: Request, res: Response) => {
  try {
    const userRole = req.params.role;
    const userData = userSchema.parse(req.body);
    const role = roles.find((find) => find.name === userRole);
    if (!role || role.name === "admin") {
      res.status(400).json({ message: "Invalid role provided" });
      return;
    }
    const hashPass = await hash(userData.password, 10);
    const user: typeof usersTable.$inferInsert = {
      ...userData,
      password: hashPass,
      roleId: role.priority,
    };
    const data = await db
      .insert(usersTable)
      .values(user)
      .returning({ name: usersTable.name, email: usersTable.email });
    res.status(201).json(data);
  } catch (error) {
    console.error("Error Updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userRole = req.params.role;
    const role = roles.find((find) => find.name === userRole);
    if (!role || role.name === "admin") {
      res.status(400).json({ message: "Invalid role provided" });
      return;
    }
    const updatedData = updateUserSchema.parse(req.body);
    const data = await db
      .update(usersTable)
      .set({ ...updatedData })
      .returning({ name: usersTable.name, email: usersTable.email });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error Updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.params;
    const userRole = roles.find((find) => find.name === role);
    if (!userRole || userRole.name === "admin") {
      res.status(400).json({ message: "Invalid role provided" });
      return;
    }
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.status(200).json({ message: "Successfully Deleted" });
  } catch (error) {
    console.error("Error Deleting User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.params as { role: Role };
    const roleMap: { [key in Role]: number } = {
      hod: 2,
      staff: 3,
      student: 4,
    };
    const roleId = roleMap[role];
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.roleId, roleId));
    const safeData = users.map(({ password, ...user }) => user);
    res.status(200).json(safeData);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const viewLeave = async (req: Request, res: Response) => {
  const studentUsers = alias(usersTable, "student_user");
  try {
    const leaves = await db
      .select({
        leaveId: leaveRequestsTable.id,
        leaveType: leaveRequestsTable.leaveType,
        from: leaveRequestsTable.startDate,
        to: leaveRequestsTable.endDate,
        reason: leaveRequestsTable.reason,
        approvedBy: usersTable.name,
        studentName: studentUsers.name,
        image: studentUsers.image,
        status: leaveRequestsTable.status,
      })
      .from(leaveRequestsTable)
      .leftJoin(usersTable, eq(leaveRequestsTable.approvedBy, usersTable.id))
      .leftJoin(studentUsers, eq(leaveRequestsTable.userId, studentUsers.id));

    // .where(eq(leaveRequestsTable.status, "pending"));
    res.status(200).json({ leaves });
  } catch (error) {
    console.error("Error View leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const processLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;
    const approverId = res.locals.userData.id; // Authenticated user

    // Validate leaveId and status
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    // Fetch leave request and approver details in a single query
    const [leaveRequest, approver] = await Promise.all([
      db
        .select()
        .from(leaveRequestsTable)
        .where(eq(leaveRequestsTable.id, leaveId))
        .limit(1)
        .then((res) => res[0]),
      db
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, approverId))
        .limit(1)
        .then((res) => res[0]),
    ]);

    if (!leaveRequest) {
      res.status(404).json({ message: "Leave request not found" });
      return;
    }
    if (leaveRequest.status !== "pending") {
      res.status(400).json({ message: "Leave request is not pending" });
      return;
    }
    if (!approver) {
      res.status(403).json({ message: "Approver not found" });
      return;
    }

    // Process based on status
    if (status === "approved") {
      await handleApprove(leaveRequest, approverId);
    } else {
      await handleReject(leaveRequest, approverId);
    }

    res.status(200).json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error("Error processing leave request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const handleApprove = async (
  leaveRequest: typeof leaveRequestsTable.$inferSelect,
  approverId: string
) => {
  // Fetch user's leave balance
  const userLeave = await db
    .select()
    .from(userLeavesTable)
    .where(eq(userLeavesTable.userId, leaveRequest.userId!))
    .limit(1)
    .then((res) => res[0]);

  if (!userLeave) {
    throw new Error("User leave record not found");
  }

  const leaveDeduction = leaveRequest.leaveType === "Full Day" ? 1 : 0.5;
  if (userLeave.availableLeave < leaveDeduction) {
    throw new Error("Insufficient leave balance");
  }

  // Perform transaction: update userLeavesTable & leaveRequestsTable
  await db.transaction(async (tx) => {
    await tx
      .update(userLeavesTable)
      .set({
        availableLeave: userLeave.availableLeave - leaveDeduction,
        usedLeave: userLeave.usedLeave + leaveDeduction,
        attendancePercentage: (
          ((userLeave.totalWorkingDays! -
            (userLeave.usedLeave + leaveDeduction)) /
            userLeave.totalWorkingDays!) *
          100
        ).toFixed(1),
      })
      .where(eq(userLeavesTable.userId, leaveRequest.userId!));

    await tx
      .update(leaveRequestsTable)
      .set({ status: "approved", approvedBy: approverId })
      .where(eq(leaveRequestsTable.id, leaveRequest.id));
  });
};
const handleReject = async (
  leaveRequest: typeof leaveRequestsTable.$inferSelect,
  approverId: string
) => {
  await db
    .update(leaveRequestsTable)
    .set({ status: "rejected", approvedBy: approverId })
    .where(eq(leaveRequestsTable.id, leaveRequest.id));
};
export const getStudentData = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.roleId, 4));
    res.status(200).json(data);
  } catch (error) {
    console.error("Error processing student Data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const dashboardInfo = async (req: Request, res: Response) => {
  try {
    const [pendingRequests, approvedRequests, rejectedRequests] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(leaveRequestsTable)
          .where(eq(leaveRequestsTable.status, "pending")),
        db
          .select({ count: count() })
          .from(leaveRequestsTable)
          .where(eq(leaveRequestsTable.status, "approved")),
        db
          .select({ count: count() })
          .from(leaveRequestsTable)
          .where(eq(leaveRequestsTable.status, "rejected")),
      ]);

    res.json({
      pendingRequests: pendingRequests[0].count,
      approvedRequests: approvedRequests[0].count,
      rejectedRequests: rejectedRequests[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
