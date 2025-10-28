import "dotenv/config"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { InitializeDatabase } from './configurations/database-initializer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // initialize
  await InitializeDatabase(app);

  app.setGlobalPrefix("api");
  useSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  
  await app.listen(process.env.PORT ?? 5000);
}

function useSwagger(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('Labres API')
    .setDescription('This is the official mcwd api')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, documentFactory);
}

bootstrap().catch(console.error);
