import express from "express";
import helmet from "helmet";
import env, { isDevelopment } from "../env.ts";
import cors from "cors";
import { pool } from "./db/connection.ts";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (req, res) => {
  let dbIsHealthy = false;

  try {
    await pool.query("SELECT 1");
    dbIsHealthy = true;
  } catch (err) {
    console.error(
      "DB Health Check Failed:",
      err instanceof Error ? err.message : err,
    );
  }

  res.status(dbIsHealthy ? 200 : 503).json({
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: dbIsHealthy ? "OK" : "FAILURE",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong!",
      ...(isDevelopment && { details: err.message }),
    });
  },
);

export { app };
export default app;
