import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "dotenv/config"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log(`ASD: ${process.env.DATABASE_URL}`);
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap().catch(console.error);
