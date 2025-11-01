import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
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
    async seedMonthDays(@Body() dto: SeedMonthDayDto) {
        return await this.service.SeedMonthDayAsync(dto);
    }

    @Patch("/:monthDayId")
    async update(
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
        @Body() body: UpdateMonthDayDto,
    ) {
        return await this.service.UpdateMonthDay(monthDayId, body);
    }
}
