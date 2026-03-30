import env from "./env.ts";
import { pool } from "./db/connection.ts";
import app from "./server.ts";

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
