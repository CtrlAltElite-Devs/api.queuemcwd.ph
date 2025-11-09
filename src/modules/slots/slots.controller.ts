import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { Slot } from "src/entities/slot.entity";
import { UseAdminOnlyGuard, UseSlotGuard } from "src/security/decorators/index.decorators";
import { CurrentAdmin } from "src/security/decorators/queried-entity-decorators/current-admin.decorator";
import { SlotEntity } from "src/security/decorators/queried-entity-decorators/slot-entity.decorator";
import { AdminDto } from "../admin/dto/admin.dto";
import { CreateSlotDto } from "./dtos/create-slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotsService } from "./slots.service";

@Controller("slots")
export class SlotsController {
    constructor(private readonly service: SlotsService) {}

    @Get("/:slotId")
    @UseSlotGuard()
    async GetSlot(@SlotEntity() slot: Slot) {
        return await this.service.GetSlotByIdAsync(slot);
    }

    @Patch("/:slotId")
    @UseSlotGuard()
    async update(@SlotEntity() slot: Slot, @Body() body: UpdateSlotDto) {
        return await this.service.UpdateSlotAsync(slot, body);
    }

    @Post()
    @UseAdminOnlyGuard()
    async create(@CurrentAdmin() admin: AdminDto, @Body() body: CreateSlotDto) {
        return await this.service.CreateSlot(admin, body);
    }

    @Delete("/:slotId")
    @UseSlotGuard()
    async delete(@SlotEntity() slot: Slot) {
        return await this.service.DeleteSlot(slot);
    }
}
