import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/worker.routes.js"
import trainingModuleRoutes from "./routes/training-module.routes.js";
import certificateRoutes
  from "./routes/certificate.routes.js";
import siteSafetyRoutes from "./modules/site-safety/site-safety.routes.js";
import trainingSessionRoutes from "./routes/training-session.routes.js";
import reportRoutes from "./routes/report.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AR Safety Backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/workers",workerRoutes)
app.use(
  "/api/training-modules",
  trainingModuleRoutes
);
app.use(
  "/api/training-sessions",
  trainingSessionRoutes
);

app.use("/api/site-safety", siteSafetyRoutes);

app.use("/api/admin/reports", reportRoutes);

app.use(
  "/api/certificates",
  certificateRoutes
);


//GET PDF-> http://localhost:5000/api/admin/reports/export

export default app;