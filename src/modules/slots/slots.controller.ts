import { Controller, Get, Param } from "@nestjs/common";
import { SlotsService } from "./slots.service";

@Controller("slots")
export class SlotsController{
    constructor(
        private readonly service: SlotsService
    ){}

    @Get('/:monthDayId')
    async getSlots(
        @Param('monthDayId') monthDayId: string,
    ){
        return await this.service.GetSlotsForMonthDayByIdAsync(monthDayId);
    }
}