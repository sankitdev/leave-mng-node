import express from "express";
import { verifyAuth } from "../controllers/authController";
const auth = express.Router();
auth.post("/auth/verify", verifyAuth);
export default auth;
