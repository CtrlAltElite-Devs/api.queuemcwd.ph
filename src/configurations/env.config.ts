import z from "zod";
import "dotenv/config";

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(5000),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
