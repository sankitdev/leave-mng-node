import { leaveRequestsTable, rolesTable, usersTable } from "./../db/schema";
import { Request, Response } from "express";
import { db } from "../db/index";
import { hash, compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/generateToken";
import { leaveRequestSchema, userSchema } from "../validations/validation";
import { main } from "../services/emailService";
export const studentRegister = async (req: Request, res: Response) => {
  try {
    const userData = userSchema.parse(req.body);
    const hashPass = await hash(userData.password, 10);
    const user: typeof usersTable.$inferInsert = {
      ...userData,
      password: hashPass,
      roleId: 4,
    };
    await db.insert(usersTable).values(user);
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Enter credentials" });
    }
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValidPassword = await compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const userRole = await db
      .select({ roles: rolesTable.name })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.id, user[0].id));
    const userData = {
      id: user[0].id,
      role: userRole[0].roles,
    };
    const token = generateToken(userData);
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 3600000,
      secure: true,
    });
    return res.status(200).json({
      message: `Login successful for ${userData.role}`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updatedData = userSchema.parse(req.body);
    await db.update(usersTable).set({ ...updatedData });
    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.issue });
  }
};
export const leaveRequest = async (req: Request, res: Response) => {
  try {
    const studentLeave: typeof leaveRequestsTable.$inferInsert =
      leaveRequestSchema.parse(req.body);
    const { id } = res.locals.userData;
    await db.insert(leaveRequestsTable).values({ ...studentLeave, userId: id });
    main();
    res.status(200).json({ message: `Leave Applied` });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
