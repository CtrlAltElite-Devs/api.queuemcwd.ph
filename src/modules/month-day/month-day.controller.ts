import { Controller, Get, Query } from "@nestjs/common";
import { MonthDayService } from "./month-day.service";
import { MonthDayResourceParameter } from "./resource-parameters/month-day-resource-parameters";

@Controller("month-day")
export class MonthDayController {
    constructor(
        private readonly service: MonthDayService
    ){}

    @Get()
    async getMonthDays(
        @Query() params: MonthDayResourceParameter
    ){
        return await this.service.getMonthDaySlots(params);
    }
}