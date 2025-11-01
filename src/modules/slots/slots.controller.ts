import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from "@nestjs/common";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotsService } from "./slots.service";

@Controller("slots")
export class SlotsController {
    constructor(private readonly service: SlotsService) {}

    @Get("/:monthDayId")
    async getSlots(@Param("monthDayId", new ParseUUIDPipe()) monthDayId: string) {
        return await this.service.GetSlotsForMonthDayByIdAsync(monthDayId);
    }

    @Patch("/:slotId")
    async update(
        @Param("slotId", new ParseUUIDPipe()) slotId: string,
        @Body() body: UpdateSlotDto,
    ) {
        return await this.service.UpdateSlotAsync(slotId, body);
    }
}
