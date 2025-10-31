import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { InitializeDatabase } from "./configurations/database-initializer.config";
import { UseApiDocumentations } from "./configurations/open-api.config";
import { UseApiVersioning } from "./configurations/api-versioning.config";
import { env } from "./configurations/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await InitializeDatabase(app);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  UseApiVersioning(app);

  UseApiDocumentations(app);
  app.enableCors({ origin: true, credentials: true });

  const port = env.PORT ?? 5009;
  await app.listen(port);
  console.log(`✅ Server running on port ${port}`);
}

bootstrap().catch(console.error);
