import e from "express";
import {
  leaveData,
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
user.get("/leaveData/:department", auth(["student"]), leaveData);
export default user;
