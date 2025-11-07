import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import { UseAdminOnlyGuard } from "src/security/decorators/index.decorators";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { MonthDayService } from "./month-day.service";

@Controller("month-day")
export class MonthDayController {
    constructor(private readonly service: MonthDayService) {}

    @Get("/:monthDayId")
    @UseAdminOnlyGuard()
    async get(
        @Req() request: AuthenticatedRequest,
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
    ) {
        return await this.service.GetMonthDayById(request.admin!, monthDayId);
    }

    @Patch("/:monthDayId")
    @UseAdminOnlyGuard()
    async update(
        @Req() request: AuthenticatedRequest,
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
        @Body() body: UpdateMonthDayDto,
    ) {
        return await this.service.UpdateMonthDay(request.admin!, monthDayId, body);
    }
}
