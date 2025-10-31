import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { InitializeDatabase } from "./configurations/database-initializer.config";
import { UseApiDocumentations } from "./configurations/open-api.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // initialize
  await InitializeDatabase(app);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  UseApiDocumentations(app);
  app.enableCors({ origin: true, credentials: true });

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap().catch(console.error);
