import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import config from "../mikro-orm.config";
import { AppController } from "./app.controller";
import { validateEnv } from "./configurations/env/env.validation";
import { jwtEnv } from "./configurations/env/jwt.env";
import { cronJobs } from "./cron-jobs/index.jobs";
import { AdminModule } from "./modules/admin/admin.module";
import { AppointmentModule } from "./modules/appointment/appointment.module";
import { BranchModule } from "./modules/branch/branch.module";
import { CommonModule } from "./modules/common/common.module";
import { MonthDayModule } from "./modules/month-day/month-day.module";
import { SlotModule } from "./modules/slots/slots.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        ScheduleModule.forRoot(),
        MikroOrmModule.forRootAsync({ useFactory: () => config }),
        JwtModule.register({
            global: true,
            secret: jwtEnv.JWT_SECRET,
            signOptions: {
                expiresIn: "300s",
            },
        }),
        SlotModule,
        MonthDayModule,
        AppointmentModule,
        BranchModule,
        AdminModule,
        CommonModule,
    ],
    controllers: [AppController],
    providers: [...cronJobs],
})
export class AppModule {}
