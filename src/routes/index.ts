import e from "express";
import user from "./userRoutes";
import admin from "./adminRoutes";
const router = e.Router();

router.use("/", user);
router.use("/", admin);
export default router;
