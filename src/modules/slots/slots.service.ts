import { Injectable } from "@nestjs/common";
import { SlotsRepository } from "src/repositories/slots.repository";

@Injectable()
export class SlotsService{
    constructor(
        private readonly slotRepository: SlotsRepository
    ) {}

    async GetSlotsForMonthDayById(monthDayId: string){
        return await this.slotRepository.findAll({
            where: {
                monthDay: { id: monthDayId },
            },
        });
    }
}