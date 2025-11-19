import z from "zod";

export const redisEnvSchema = z.object({
    REDIS_URL: z.url(),
});

export type RedisEnv = z.infer<typeof redisEnvSchema>;

export const redisEnv = redisEnvSchema.parse(process.env);
