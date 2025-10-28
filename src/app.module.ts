import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import config from "../mikro-orm.config";
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MonthDaySeederJob } from './cron-jobs/month-day-seeder-job';
import { SlotModule } from './modules/slots/slots.module';
import { MonthDayModule } from './modules/month-day/month-day.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

@Module({
  imports: [ScheduleModule.forRoot(),
    MikroOrmModule.forRootAsync({useFactory: () => config}),
    SlotModule, MonthDayModule, AppointmentModule
  ],
  controllers: [AppController],
  providers: [AppService, MonthDaySeederJob],
})
export class AppModule {}
