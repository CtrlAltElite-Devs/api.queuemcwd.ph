import { INestApplication, ValidationPipe } from "@nestjs/common";
import { env, resolvePort } from "./env/env.config";

export default function ApplyConfigurations(app: INestApplication<any>) {
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true }, // 👈 converts "11" -> 11 automatically
        }),
    );
}

function exposeApiDocumentationInLogs() {
    if (env.NODE_ENV !== "development") return;
    const port = resolvePort();
    console.log(`📚 Swagger API docs available at: http://localhost:${port}/swagger`);
    console.log(`🔖 Scalar API docs available at: http://localhost:${port}/docs`);
}

export const usePostBootstrap = () => {
    exposeApiDocumentationInLogs();
};
