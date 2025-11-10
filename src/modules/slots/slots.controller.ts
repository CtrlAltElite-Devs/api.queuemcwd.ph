import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { Slot } from "src/entities/slot.entity";
import { UseAdminOnlyGuard, UseSlotGuard } from "src/security/decorators/index.decorators";
import { CurrentAdmin } from "src/security/decorators/queried-entity-decorators/current-admin.decorator";
import { SlotEntity } from "src/security/decorators/queried-entity-decorators/slot-entity.decorator";
import { AdminDto } from "../admin/dto/admin.dto";
import { CreateSlotDto } from "./dtos/create-slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotsService } from "./slots.service";

@ApiTags("Slots")
@Controller("slots")
export class SlotsController {
    constructor(private readonly service: SlotsService) {}

    @Get("/:slotId")
    @ApiParam({ name: "slotId", type: "string", format: "uuid", required: true })
    @UseSlotGuard()
    async getSlot(@SlotEntity() slot: Slot) {
        return await this.service.GetSlotByIdAsync(slot);
    }

    @Patch("/:slotId")
    @ApiParam({ name: "slotId", type: "string", format: "uuid", required: true })
    @UseSlotGuard()
    async update(@SlotEntity() slot: Slot, @Body() body: UpdateSlotDto) {
        return await this.service.UpdateSlotAsync(slot, body);
    }

    @Delete("/:slotId")
    @ApiParam({ name: "slotId", type: "string", format: "uuid", required: true })
    @UseSlotGuard()
    async delete(@SlotEntity() slot: Slot) {
        return await this.service.DeleteSlot(slot);
    }

    @Post()
    @UseAdminOnlyGuard()
    async create(@CurrentAdmin() admin: AdminDto, @Body() body: CreateSlotDto) {
        return await this.service.CreateSlot(admin, body);
    }
}
