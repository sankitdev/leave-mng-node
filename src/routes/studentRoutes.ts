import e from "express";
import {
  applyLeave,
  getLeaveBalance,
  getLeavesByDepartment,
  getPersonalLeaveRequests,
  getTeacherForLeave,
  studentRegister,
  updateProfile,
} from "../controllers/studentController";
import { auth } from "../middleware/auth";
const student = e.Router();

student.post("/register", studentRegister);
student.patch(
  "/update-profile",
  auth(["student", "hod", "staff"]),
  updateProfile
);
student.get("/staff/:department", auth(["student"]), getTeacherForLeave);
student.post("/apply-leave", auth(["student"]), applyLeave);
student.get("/leaves/requests", auth(["student"]), getPersonalLeaveRequests);
student.get("/leaves/balance", auth(["student"]), getLeaveBalance);
student.get(
  "/leaves/:department",
  auth(["student", "admin", "hod", "staff"]),
  getLeavesByDepartment
);
export default student;
