import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/config";
export const auth = (allowedRoles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authToken } = req.cookies;
      if (!authToken) {
        res.status(401).json({ message: "Invalid Credentials" });
        return;
      }
      if (!JWT_SECRET) return;
      jwt.verify(authToken, JWT_SECRET, function (err, decoded) {
        if (err) {
          res.status(401).json({ message: "Unauthorized Access" });
          return;
        }
        if (allowedRoles && !allowedRoles.includes(decoded.userData.role)) {
          res.status(403).json({
            message: "Forbidden: You do not have access to this resource",
          });
          return;
        }
        res.locals = decoded;
        next();
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};
