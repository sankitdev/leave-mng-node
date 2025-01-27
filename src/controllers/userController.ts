import {
  leaveRequestsTable,
  rolesTable,
  userLeavesTable,
  usersTable,
} from "./../db/schema";
import { Request, Response } from "express";
import { db } from "../db/index";
import { hash, compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/generateToken";
import { leaveRequestSchema, userSchema } from "../validations/validation";
import { main } from "../services/emailService";
import getAcademicYear from "../utils/getAcademicYear";
export const studentRegister = async (req: Request, res: Response) => {
  try {
    const userData = userSchema.parse(req.body);
    const hashPass = await hash(userData.password, 10);
    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(usersTable)
        .values({ ...userData, password: hashPass, roleId: 4 })
        .returning({ id: usersTable.id });

      if (!newUser) throw new Error("User creation failed");
      await tx
        .insert(userLeavesTable)
        .values({ userId: newUser.id, academicYear: getAcademicYear() });
    });
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Error Registering Student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Enter credentials" });
    }
    const user = await db
      .select({
        id: usersTable.id,
        password: usersTable.password,
        role: rolesTable.name,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.email, email));
    if (!user?.[0]) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValidPassword = await compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const userData = {
      id: user[0].id,
      role: user[0].role,
    };
    const token = generateToken(userData);
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 3600000,
      secure: true,
    });
    return res.status(200).json({
      message: `Login successful for ${userData.role}`,
      userData,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const logoutUser = (req: Request, res: Response) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "Please Login" });
    }
    res.clearCookie("authToken", {
      httpOnly: true,
      maxAge: 0,
      secure: true,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error while Logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const updatedData = userSchema.parse(req.body);
    await db.update(usersTable).set({ ...updatedData });
    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    console.error("Error while profile update:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    console.error("Error while requesting Leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
