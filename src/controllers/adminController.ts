import { hash } from "bcrypt";
import { db } from "../db";
import { leaveRequestsTable, userLeavesTable, usersTable } from "../db/schema";
import { userSchema } from "./../validations/validation";
import { Request, Response } from "express";
import { roles } from "../config/constant";
import { eq } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

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
export const leaveApprove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!uuid(id)) {
      return res.status(400).json({ message: "Invalid UUID format" });
    }
    // check if any request available with the id
    const [leaveRequest] = await db
      .select()
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.userId, id));
    console.log(leaveRequest);
    if (!leaveRequest) {
      return res.status(404).json({ message: "No record found" });
    }
    if (leaveRequest.status !== "pending") {
      return res.status(400).json({ message: "Leave request is not pending" });
    }
    // fetch the user's leave balance
    const [userLeave] = await db
      .select()
      .from(userLeavesTable)
      .where(eq(userLeavesTable.userId, leaveRequest.userId!));
    if (!userLeave) {
      return res.status(404).json({ message: "User leave record not found" });
    }
    const leaveDeduction = leaveRequest.leaveType === "full_day" ? 1 : 0.5;
    if (userLeave.availableLeave < leaveDeduction) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }
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
        .set({ status: "approved" })
        .where(eq(leaveRequestsTable.userId, id));
    });
    res.status(200).json({ message: "Leave request approved successfully" });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
