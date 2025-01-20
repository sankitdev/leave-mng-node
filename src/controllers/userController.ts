import { usersTable } from "./../db/schema";
import { Request, Response } from "express";
import { db } from "../db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
export const studentRegister = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      image,
      phone,
      address,
      department,
      roleId,
    } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const user: typeof usersTable.$inferInsert = {
      name,
      email,
      password: hashPass,
      gender,
      image,
      phone,
      address,
      department,
      roleId,
    };
    await db.insert(usersTable).values(user);
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
  } catch (error) {}
};
