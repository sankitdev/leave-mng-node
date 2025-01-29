import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JWT_SECRET } from "../config/config";
import { db } from "../db";
import { rolesTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { generateToken } from "../utils/generateToken";

export const verifyAuth = (req: Request, res: Response) => {
  try {
    const { authToken } = req.cookies;
    if (!authToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    jwt.verify(authToken, JWT_SECRET!, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      res.status(200).json({ authenticated: true, user: decoded.userData });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Enter credentials" });
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        password: usersTable.password,
        role: rolesTable.name,
        name: usersTable.name,
        email: usersTable.email,
        image: usersTable.image,
        department: usersTable.department,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const { id, role, name, image, department } = user;

    const userData = {
      id,
      role,
      name,
      email: user.email,
      image,
      department,
    };
    const token = generateToken({ id, role });
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 3600000,
      secure: true,
    });
    res.status(200).json({
      message: `Login successful for ${userData.role}`,
      userData,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const logoutUser = (req: Request, res: Response) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      res.status(401).json({ message: "Please Login" });
      return;
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
