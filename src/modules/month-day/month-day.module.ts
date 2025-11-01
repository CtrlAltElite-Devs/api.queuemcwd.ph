import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { CommonModule } from "../common/common.module";
import { MonthDayController } from "./month-day.controller";
import { MonthDayService } from "./month-day.service";

@Module({
    imports: [MikroOrmModule.forFeature([MonthDay, Branch]), CommonModule],
    controllers: [MonthDayController],
    providers: [MonthDayService],
})
export class MonthDayModule {}
