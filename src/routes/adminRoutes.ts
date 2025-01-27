import e from "express";
import { auth } from "../middleware/auth";
import {
  addUser,
  deleteUser,
  getUsers,
  leaveApprove,
  viewLeave,
} from "../controllers/adminController";
const admin = e.Router();

admin.post("/user/:role", auth(["admin"]), addUser);
admin.delete("/user/:role/:userId", auth(["admin"]), deleteUser);
admin.get("/users", auth(["admin"]), getUsers);
admin.get("/leaves", auth(["admin", "hod", "staff"]), viewLeave);
admin.patch(
  "/leave-approve/:id",
  auth(["admin", "hod", "staff"]),
  leaveApprove
);
export default admin;
