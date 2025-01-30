import e from "express";
import { auth } from "../middleware/auth";
import {
  addUser,
  dashboardInfo,
  deleteUser,
  getStudentData,
  getUsers,
  processLeaveRequest,
  viewLeave,
} from "../controllers/adminController";
const admin = e.Router();

admin.post("/user/:role", auth(["admin"]), addUser);
admin.delete("/user/:role/:userId", auth(["admin"]), deleteUser);
admin.get("/users/:role", auth(["admin", "hod", "staff", "student"]), getUsers);
admin.get("/leaves", auth(["admin", "hod", "staff"]), viewLeave);
admin.patch(
  "/leave-request/:leaveId/update",
  auth(["admin", "hod", "staff"]),
  processLeaveRequest
);
admin.get("/students", auth(["admin", "hod", "staff"]), getStudentData);
admin.get("/dashboard", auth(["admin", "hod", "staff"]), dashboardInfo);
export default admin;
