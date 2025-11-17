import "dotenv/config";
import z from "zod";
import { adminEnvSchema } from "./admin.env";
import { databaseEnvSchema } from "./database.env";
import { jwtEnvSchema } from "./jwt.env";
import { redisEnvSchema } from "./redis.env";
import { serverEnvSchema } from "./server.env";

// Combine schemas
export const envSchema = z.object({
    ...databaseEnvSchema.shape,
    ...serverEnvSchema.shape,
    ...adminEnvSchema.shape,
    ...jwtEnvSchema.shape,
    ...redisEnvSchema.shape,
});

export type Env = z.infer<typeof envSchema>;

// Parse and export
export const env = envSchema.parse(process.env);

// Optional helper
export const resolvePort = () => env.PORT || 5000;
