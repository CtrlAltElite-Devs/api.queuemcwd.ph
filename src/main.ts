import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import "dotenv/config"
import { DatabaseSeeder } from './seeders/DatabaseSeeder';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // initialize
  try{
    await migrate(app);
    await seed(app);
  }catch(error){
    console.error('❌ Database initialization failed:', error);
    console.error(error);
    process.exit(1);
  }

  app.setGlobalPrefix("api");
  useSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  await app.listen(process.env.PORT ?? 3000);
}

async function migrate(app: INestApplication<any>){
    const orm = app.get(MikroORM);
    const migrator = orm.getMigrator();
    const migrationResult = await migrator.up();
    console.log("migration result: ", JSON.stringify(migrationResult, null, 3))
}

async function seed(app: INestApplication<any>){
    const orm = app.get(MikroORM);
    await orm.getSeeder().seed(DatabaseSeeder);
}

function useSwagger(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('Labres API')
    .setDescription('This is the official mcwd api')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);
}

bootstrap().catch(console.error);
