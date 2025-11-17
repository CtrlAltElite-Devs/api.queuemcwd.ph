import z from "zod";

export const databaseEnvSchema = z.object({
    DATABASE_URL: z.url(),
    MYSQL_ROOT_PASSWORD: z.string().min(1),
    MYSQL_DATABASE: z.string().min(1),
    MYSQL_USER: z.string().min(1),
    MYSQL_PASSWORD: z.string().min(1),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
