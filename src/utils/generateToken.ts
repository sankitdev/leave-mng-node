import jwt from "jsonwebtoken";
import { JWT_EXPIRATION, JWT_SECRET } from "../config/config";
export const generateToken = (userRole: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const token = jwt.sign({ role: userRole }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  return token;
};
