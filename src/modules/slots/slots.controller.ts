import { Controller, Get, Param } from "@nestjs/common";
import { SlotsService } from "./slots.service";

@Controller("slots")
export class SlotsController{
    constructor(
        private readonly service: SlotsService
    ){}

    @Get('/:id')
    async getSlots(
        @Param('id') id: string,
    ){
        return await this.service.GetSlotsForMonthDayById(id);
    }
}