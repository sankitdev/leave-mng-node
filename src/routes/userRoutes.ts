import e from "express";
import {
  getUsers,
  loginUser,
  studentRegister,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
const user = e.Router();

user.post("/register", studentRegister);
user.post("/login", loginUser);
user.get("/users", auth, getUsers);
export default user;
