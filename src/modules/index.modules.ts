import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { validateEnv } from "src/configurations/env/env.validation";
import { jwtEnv } from "src/configurations/env/jwt.env";
import config from "../../mikro-orm.config";
import { AdminModule } from "./admin/admin.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { BranchModule } from "./branch/branch.module";
import { CommonModule } from "./common/common.module";
import { MonthDayModule } from "./month-day/month-day.module";
import { SlotModule } from "./slots/slots.module";

export const ApplicationModules = [
    AdminModule,
    AppointmentModule,
    BranchModule,
    CommonModule,
    MonthDayModule,
    SlotModule,
];

export const InfrastructureModules = [
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
            expiresIn: "5m",
        },
    }),
    CacheModule.register({
        isGlobal: true,
    }),
];
