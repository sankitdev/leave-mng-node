import e from "express";
import {
  leaveRequest,
  loginUser,
  logoutUser,
  studentRegister,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
const user = e.Router();

user.post("/register", studentRegister);
user.post("/login", loginUser);
user.post("/apply-leave", auth(["student"]), leaveRequest);
user.post("/logout", logoutUser);
export default user;
