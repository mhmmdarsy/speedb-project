import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";
import scheduleRouters from "./routes/schedules";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", publicRoutes);
app.use("/api", adminRoutes);
app.use("/api", scheduleRouters);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("GLOBAL EXPRESS ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});
