import z from "zod";

export const serverEnvSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
