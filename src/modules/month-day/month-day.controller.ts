import { Controller, Get, Post, Query } from "@nestjs/common";
import { MonthDayService } from "./month-day.service";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";
import { SeedMonthDayDto } from "./dtos/seed-month-day.dto";

@Controller("month-day")
export class MonthDayController {
    constructor(private readonly service: MonthDayService){}

    @Get()
    async getMonthDays(@Query() params: MonthDayResourceParameter){
        return await this.service.GetMonthDaysAsync(params);
    }

    @Post("seed")
    async seedMonthDays(@Query() dto: SeedMonthDayDto){
        return await this.service.SeedMonthDayAsync(dto);
    }
}