import * as dotenv from "dotenv";
import path from "node:path";
import z from "zod";

const nodeEnv = process.env.NODE_ENV || "development";
const envFile = nodeEnv === "test" ? ".env.test" : ".env";

dotenv.config({ path: path.resolve(process.cwd(), envFile), override: true });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_STAGE: z.enum(["dev", "prod"]).default("dev"),
  PORT: z.coerce.number().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .or(z.array(z.string()))
    .transform((val) => {
      if (typeof val === "string") {
        return val.split(",").map((origin) => origin.trim());
      }
      return val;
    })
    .default([]),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
});

type Env = z.infer<typeof envSchema>;

let env: Env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Invalid environment variables", error);
    console.error(JSON.stringify(z.treeifyError(error), null, 2));

    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      console.error(`  ${path}: ${issue.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";

export { env };
export default env;
