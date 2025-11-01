import z from "zod";

export const jwtEnvSchema = z.object({
    JWT_SECRET: z.string(),
});

export type JwtEnv = z.infer<typeof jwtEnvSchema>;

export const jwtEnv = jwtEnvSchema.parse(process.env);
