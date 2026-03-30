import express from "express";
import helmet from "helmet";
import env from "./env.ts";
import cors from "cors";
import healthRouter from "./routes/health.routes.ts";
import tasksRouter from "./routes/tasks.routes.ts";
import { errorHandler } from "./middleware/error.middleware.ts";

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

app.use("/health", healthRouter);
app.use("/tasks", tasksRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

export { app };
export default app;
