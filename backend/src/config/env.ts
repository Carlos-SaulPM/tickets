import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
  UPLOADS_DIR: z.string().min(1).default("./uploads"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Variables de entorno inválidas:");
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
