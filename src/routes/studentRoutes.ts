import e from "express";
import {
  applyLeave,
  getLeaveBalance,
  getLeavesByDepartment,
  getPersonalLeaveRequests,
  studentRegister,
} from "../controllers/studentController";
import { auth } from "../middleware/auth";
const student = e.Router();

student.post("/register", studentRegister);
student.post("/apply-leave", auth(["student"]), applyLeave);
student.get("/leaves/requests", auth(["student"]), getPersonalLeaveRequests);
student.get("/leaves/balance", auth(["student"]), getLeaveBalance);
student.get("/leaves/:department", auth(["student"]), getLeavesByDepartment);
export default student;
