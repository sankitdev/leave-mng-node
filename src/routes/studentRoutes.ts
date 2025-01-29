import e from "express";
import {
  applyLeave,
  getDepartmentLeaves,
  getLeaveBalance,
  getPersonalLeaveRequests,
  studentRegister,
} from "../controllers/studentController";
import { auth } from "../middleware/auth";
const user = e.Router();

user.post("/register", studentRegister);
user.post("/apply-leave", auth(["student"]), applyLeave);
user.get("/leaves/:department", auth(["student"]), getDepartmentLeaves);
user.get("/leaves/requests", auth(["student"]), getPersonalLeaveRequests);
user.get("/leaves/balance", auth(["student"]), getLeaveBalance);
export default user;
