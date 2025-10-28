import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Slot } from "src/entities/slot.entity";
import { SlotsController } from "./slots.controller";
import { SlotsService } from "./slots.service";

@Module({
    imports: [MikroOrmModule.forFeature([Slot])],
    controllers: [SlotsController],
    providers: [SlotsService]
})
export class SlotModule{}