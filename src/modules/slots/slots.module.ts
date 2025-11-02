import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { AdminModule } from "../admin/admin.module";
import { CommonModule } from "../common/common.module";
import { SlotsController } from "./slots.controller";
import { SlotsService } from "./slots.service";

@Module({
    imports: [MikroOrmModule.forFeature([Slot, MonthDay]), CommonModule, AdminModule],
    controllers: [SlotsController],
    providers: [SlotsService],
})
export class SlotModule {}
