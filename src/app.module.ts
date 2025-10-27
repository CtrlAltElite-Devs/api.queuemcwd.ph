import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TestCronService } from './cron-jobs/test-cron-service';
import config from "../mikro-orm.config";
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [ScheduleModule.forRoot(),
    MikroOrmModule.forRootAsync({useFactory: () => config})
  ],
  controllers: [AppController],
  providers: [AppService, TestCronService],
})
export class AppModule {}
