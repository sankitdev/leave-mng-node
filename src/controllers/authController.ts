import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JWT_SECRET } from "../config/config";

export const verifyAuth = (req: Request, res: Response) => {
  try {
    const { authToken } = req.cookies;
    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(authToken, JWT_SECRET!, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res
        .status(200)
        .json({ authenticated: true, user: decoded.userData });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
