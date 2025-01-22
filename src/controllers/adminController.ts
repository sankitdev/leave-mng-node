import { hash } from "bcrypt";
import { db } from "../db";
import { leaveRequestsTable, usersTable } from "../db/schema";
import { userSchema } from "./../validations/validation";
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
    res.status(500).json({ error });
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
    res.status(500).json({ error: error.issue });
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
    res.status(500).json({ error });
  }
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.issue });
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
    res.status(500).json({ error });
  }
};
export const leaveApprove = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    res.status(500).json({ error });
  }
};
