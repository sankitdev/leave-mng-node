import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/", router);
export default app;
