import express from "express";
import user from "./routes/userRoutes";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/", user);
export default app;
