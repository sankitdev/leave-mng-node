import { usersTable } from "./../db/schema";
import { Request, Response } from "express";
import { db } from "../db/index";
import { hash, compare } from "bcrypt";
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
    const hashPass = await hash(password, 10);
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
    return res
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user[0].id, email: user[0].email },
      });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
