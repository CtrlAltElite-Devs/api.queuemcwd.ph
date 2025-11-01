import config from "../mikro-orm.config";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { SlotModule } from "./modules/slots/slots.module";
import { MonthDayModule } from "./modules/month-day/month-day.module";
import { AppointmentModule } from "./modules/appointment/appointment.module";
import { cronJobs } from "./cron-jobs/index.jobs";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./configurations/env.validation";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        ScheduleModule.forRoot(),
        MikroOrmModule.forRootAsync({ useFactory: () => config }),
        SlotModule,
        MonthDayModule,
        AppointmentModule,
    ],
    controllers: [AppController],
    providers: [...cronJobs],
})
export class AppModule {}
