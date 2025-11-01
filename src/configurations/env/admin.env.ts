import z from "zod";

export const adminEnvSchema = z.object({
    SUPER_ADMIN_EMAIL: z.email(),
    SUPER_ADMIN_PASSWORD: z.string().min(8),
    ADMIN_DEFAULT_PASSWORD: z.string(),
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;
