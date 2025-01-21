import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/config";
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { authToken } = req.cookies;
    if (!authToken)
      return res.status(401).json({ message: "Invalid Credentials" });
    if (!JWT_SECRET) return;
    jwt.verify(authToken, JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).json({ message: "Unauthorized Access" });
      }
      req.role = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
