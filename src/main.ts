import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import UseApiVersioning from "./configurations/api-versioning.config";
import ApplyConfigurations, { usePostBootstrap } from "./configurations/bootstrap.config";
import ApplyCorsConfigurations from "./configurations/cors.config";
import InitializeDatabase from "./configurations/database-initializer.config";
import { resolvePort } from "./configurations/env/env.config";
import UseApiDocumentations from "./configurations/open-api.config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            prefix: "MCWD",
        }),
    });

    await InitializeDatabase(app);
    ApplyConfigurations(app);
    UseApiVersioning(app);

    UseApiDocumentations(app);
    ApplyCorsConfigurations(app);
    const port = resolvePort();
    await app.listen(port);
    console.log(`✅ Server running on port ${port}`);
}

bootstrap().then(usePostBootstrap).catch(console.error);
