import { Injectable } from "@nestjs/common";
import { SlotsRepository } from "src/repositories/slots.repository";
import { SlotDto } from "./dtos/slot.dto";

@Injectable()
export class SlotsService{
    constructor(
        private readonly slotRepository: SlotsRepository
    ) {}

    async GetSlotsForMonthDayById(monthDayId: string) : Promise<SlotDto[]>{
        const slots =  await this.slotRepository.findAll({
            where: {
                monthDay: { id: monthDayId },
            },
            orderBy: { startTime: 'ASC' },
            populate: ["appointments"]
        });

        const slotDtos : SlotDto[] = [];

        slots.forEach((slot) => {
            const dto = new SlotDto();
            dto.id = slot.id;
            dto.dayId = monthDayId;
            dto.startTime = slot.startTime;
            dto.endTime = slot.endTime;
            dto.maxCapacity = slot.limit;
            dto.isActive = slot.isActive;
            dto.booked = slot.appointments.length;
            slotDtos.push(dto);
        })

        return slotDtos;
    }
}