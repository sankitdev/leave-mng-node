import e from "express";
import {
  getUsers,
  leaveRequest,
  loginUser,
  studentRegister,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
const user = e.Router();

user.post("/register", studentRegister);
user.post("/login", loginUser);
user.get("/users", auth(["admin"]), getUsers);
user.post("/apply-leave", auth(["student"]), leaveRequest);
export default user;
