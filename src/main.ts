import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import "dotenv/config"
import { DatabaseSeeder } from './seeders/DatabaseSeeder';

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

bootstrap().catch(console.error);
