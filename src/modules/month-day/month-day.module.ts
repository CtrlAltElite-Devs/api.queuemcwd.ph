import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { MonthDay } from "src/entities/monthDay.entity";
import { MonthDayController } from "./month-day.controller";
import { MonthDayService } from "./month-day.service";

@Module({
    imports: [MikroOrmModule.forFeature([MonthDay])],
    controllers: [MonthDayController],
    providers: [MonthDayService]
})
export class MonthDayModule{}