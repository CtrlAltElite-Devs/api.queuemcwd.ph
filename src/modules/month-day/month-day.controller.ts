import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from "@nestjs/common";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { MonthDayService } from "./month-day.service";

@Controller("month-day")
export class MonthDayController {
    constructor(private readonly service: MonthDayService) {}

    @Get("/:monthDayId")
    async get(@Param("monthDayId", new ParseUUIDPipe()) monthDayId: string) {
        return await this.service.GetMonthDayById(monthDayId);
    }

    @Patch("/:monthDayId")
    async update(
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
        @Body() body: UpdateMonthDayDto,
    ) {
        return await this.service.UpdateMonthDay(monthDayId, body);
    }
}
