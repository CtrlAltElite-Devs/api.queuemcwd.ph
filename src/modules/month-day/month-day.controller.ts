import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import { UseAdminOnlyGuard } from "src/security/decorators/index.decorators";
import { SeedMonthDayDto } from "./dtos/seed-month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { MonthDayService } from "./month-day.service";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";

@Controller("month-day")
export class MonthDayController {
    constructor(private readonly service: MonthDayService) {}

    @Get()
    async getMonthDays(@Query() params: MonthDayResourceParameter) {
        return await this.service.GetMonthDaysAsync(params);
    }

    @Post("seed")
    @UseAdminOnlyGuard()
    async seedMonthDays(@Req() request: AuthenticatedRequest, @Body() dto: SeedMonthDayDto) {
        return await this.service.SeedMonthDayAsync(request.admin!, dto);
    }

    @Patch("/:monthDayId")
    async update(
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
        @Body() body: UpdateMonthDayDto,
    ) {
        return await this.service.UpdateMonthDay(monthDayId, body);
    }
}
