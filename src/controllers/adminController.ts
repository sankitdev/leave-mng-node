import { hash } from "bcrypt";
import { db } from "../db";
import { leaveRequestsTable, userLeavesTable, usersTable } from "../db/schema";
import { studentLeaveApprove, userSchema } from "./../validations/validation";
import { Request, Response } from "express";
import { roles } from "../config/constant";
import { eq } from "drizzle-orm";

export const addUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const userRole = req.params.role;
    const userData = userSchema.parse(req.body);
    const role = roles.find((find) => find.name === userRole);
    if (!role || role.name === "admin")
      return res.status(400).json({ message: "Invalid role provided" });
    const hashPass = await hash(userData.password, 10);
    const user: typeof usersTable.$inferInsert = {
      ...userData,
      password: hashPass,
      roleId: role.priority,
    };
    await db.insert(usersTable).values(user);
    res.status(201).json({ message: `${user.name} registered successfully` });
  } catch (error) {
    console.error("Error Updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userRole = req.params.role;
    const role = roles.find((find) => find.name === userRole);
    if (!role || role.name === "admin")
      return res.status(400).json({ message: "Invalid role provided" });
    const updatedData = userSchema.parse(req.body);
    await db.update(usersTable).set({ ...updatedData });
    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    console.error("Error Updating User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role, userId } = req.params;
    const userRole = roles.find((find) => find.name === role);
    if (!userRole || userRole.name === "admin")
      return res.status(400).json({ message: "Invalid role provided" });
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.status(200).json({ message: "Successfully Deleted" });
  } catch (error) {
    console.error("Error Deleting User:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const viewLeave = async (req: Request, res: Response) => {
  try {
    const leaves = await db
      .select()
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.status, "pending"));

    res.status(200).json(leaves);
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
      return res.status(400).json({ message: "Invalid status" });
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
      return res.status(404).json({ message: "Leave request not found" });
    }
    if (leaveRequest.status !== "pending") {
      return res.status(400).json({ message: "Leave request is not pending" });
    }
    if (!approver) {
      return res.status(403).json({ message: "Approver not found" });
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

// Approve function (updates leaveRequestsTable & userLeavesTable)
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

  const leaveDeduction = leaveRequest.leaveType === "full_day" ? 1 : 0.5;
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
      })
      .where(eq(userLeavesTable.userId, leaveRequest.userId!));

    await tx
      .update(leaveRequestsTable)
      .set({ status: "approved", approvedBy: approverId })
      .where(eq(leaveRequestsTable.id, leaveRequest.id));
  });
};

// Reject function (only updates leaveRequestsTable)
const handleReject = async (
  leaveRequest: typeof leaveRequestsTable.$inferSelect,
  approverId: string
) => {
  await db
    .update(leaveRequestsTable)
    .set({ status: "rejected", approvedBy: approverId })
    .where(eq(leaveRequestsTable.id, leaveRequest.id));
};
