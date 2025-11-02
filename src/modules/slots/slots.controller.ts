import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import { UseAdminOnlyGuard } from "src/security/decorators/index.decorators";
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
    @UseAdminOnlyGuard()
    async update(
        @Req() request: AuthenticatedRequest,
        @Param("slotId", new ParseUUIDPipe()) slotId: string,
        @Body() body: UpdateSlotDto,
    ) {
        return await this.service.UpdateSlotAsync(request.admin!, slotId, body);
    }
}
