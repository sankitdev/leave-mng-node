import e from "express";
import student from "./studentRoutes";
import admin from "./adminRoutes";
import auth from "./authRoute";
const router = e.Router();

router.use("/", student);
router.use("/", admin);
router.use("/", auth);
export default router;
