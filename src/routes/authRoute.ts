import express from "express";
import {
  loginUser,
  logoutUser,
  verifyAuth,
} from "../controllers/authController";
const auth = express.Router();
auth.post("/auth/verify", verifyAuth);
auth.post("/login", loginUser);
auth.post("/logout", logoutUser);
export default auth;
