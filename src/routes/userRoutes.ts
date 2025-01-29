import e from "express";
import {
  getLeaveRequestData,
  getUserLeaveData,
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
user.get("/leave-data", auth(["student"]), getLeaveRequestData);
user.get("/user-leaveData", auth(["student"]), getUserLeaveData);
export default user;
