import e from "express";
import user from "./userRoutes";
import admin from "./adminRoutes";
import auth from "./authRoute";
const router = e.Router();

router.use("/", user);
router.use("/", admin);
router.use("/", auth);
export default router;
