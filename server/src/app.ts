import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import symptomsRoutes from "./routes/symptoms.routes.js";
import providersRoutes from "./routes/providers.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "medassistai-server" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/symptoms", symptomsRoutes);
  app.use("/api/providers", providersRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(errorHandler);
  return app;
}
