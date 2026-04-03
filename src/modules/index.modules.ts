import KeyvRedis from "@keyv/redis";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { validateEnv } from "src/configurations/env/env.validation";
import { jwtEnv } from "src/configurations/env/jwt.env";
import { redisEnv } from "src/configurations/env/redis.env";
import config from "../../mikro-orm.config";
import { AdminModule } from "./admin/admin.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { BranchModule } from "./branch/branch.module";
import { CommonModule } from "./common/common.module";
import { RedisClientModule } from "./common/redis-module";
import { ExportModule } from "./export/export.module";
import { MonthDayModule } from "./month-day/month-day.module";
import { SlotModule } from "./slots/slots.module";

export const ApplicationModules = [
    AdminModule,
    AppointmentModule,
    BranchModule,
    CommonModule,
    MonthDayModule,
    SlotModule,
    AnalyticsModule,
    ExportModule,
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
            expiresIn: "300s",
        },
    }),
    RedisClientModule,
    CacheModule.registerAsync({
        isGlobal: true,
        useFactory: () => ({
            stores: [
                new KeyvRedis(redisEnv.REDIS_URL, {
                    throwOnErrors: true,
                    throwOnConnectError: true,
                }),
            ],
        }),
    }),
];
