import { INestApplication, ValidationPipe } from "@nestjs/common";
import { StartupJobRegistry } from "src/cron-jobs/startup-job-registry";
import { env, resolvePort } from "./env/env.config";

export default function ApplyConfigurations(app: INestApplication<any>) {
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
}

function exposeApiDocumentationInLogs() {
    if (env.NODE_ENV !== "development") return;
    const port = resolvePort();
    console.log(`📚 Swagger API docs available at: http://localhost:${port}/swagger`);
    console.log(`🔖 Scalar API docs available at: http://localhost:${port}/docs`);
}

function showStartupJobRegistrySummary() {
    StartupJobRegistry.printSummary();
}

export const usePostBootstrap = () => {
    showStartupJobRegistrySummary();
    exposeApiDocumentationInLogs();
};
