import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Slot } from "src/entities/slot.entity";
import { SlotsController } from "./slots.controller";
import { SlotsService } from "./slots.service";
import { MonthDay } from "src/entities/monthDay.entity";

@Module({
    imports: [MikroOrmModule.forFeature([Slot, MonthDay])],
    controllers: [SlotsController],
    providers: [SlotsService]
})
export class SlotModule{}