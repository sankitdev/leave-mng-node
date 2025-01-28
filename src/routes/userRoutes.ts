import e from "express";
import {
  getLeaveData,
  leaveDataOfDepartment,
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
user.get("/leaveData/:department", auth(["student"]), leaveDataOfDepartment);
user.get("/leave-data/:userId", auth(["student"]), getLeaveData);
export default user;
