import { Router } from "express";
import { pool } from "../db/connection";

const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
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
    status: dbIsHealthy ? "OK" : "FAILURE",
  });
});

export default healthRouter;
