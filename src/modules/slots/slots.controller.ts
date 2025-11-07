import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import { UseAdminOnlyGuard } from "src/security/decorators/index.decorators";
import { CreateSlotDto } from "./dtos/create-slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotsService } from "./slots.service";

@Controller("slots")
export class SlotsController {
    constructor(private readonly service: SlotsService) {}

    @Get("/:slotId")
    @UseAdminOnlyGuard()
    async GetSlot(
        @Req() request: AuthenticatedRequest,
        @Param("slotId", new ParseUUIDPipe()) slotId: string,
    ) {
        return await this.service.GetSlotByIdAsync(request.admin!, slotId);
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

    @Post()
    @UseAdminOnlyGuard()
    async create(@Req() request: AuthenticatedRequest, @Body() body: CreateSlotDto) {
        return await this.service.CreateSlot(request.admin!, body);
    }

    @Delete("/:slotId")
    @UseAdminOnlyGuard()
    async delete(
        @Req() request: AuthenticatedRequest,
        @Param("slotId", new ParseUUIDPipe()) slotId: string,
    ) {
        return await this.service.DeleteSlot(request.admin!, slotId);
    }
}
