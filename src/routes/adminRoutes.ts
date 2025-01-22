import e from "express";
import { auth } from "../middleware/auth";
import { addUser } from "../controllers/adminController";
const admin = e.Router();

admin.post("/user/:role", auth(["admin"]), addUser);
export default admin;
