import e from "express";
import { auth } from "../middleware/auth";
import { addUser } from "../controllers/adminController";
const admin = e.Router();

admin.post("/", auth(["admin"]), addUser);
