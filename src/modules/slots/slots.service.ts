import { BadRequestException, Injectable } from "@nestjs/common";
import { SlotsRepository } from "src/repositories/slots.repository";
import { SlotDto } from "./dtos/slot.dto";
import { MonthDayRepository } from "src/repositories/month-day.repository";

@Injectable()
export class SlotsService{
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly monthDayRepository: MonthDayRepository
    ) {}

    async GetSlotsForMonthDayById(monthDayId: string) : Promise<SlotDto[]>{
        const monthDay = await this.monthDayRepository.findOne({id: monthDayId}, 
            {fields: ["id", "isWorkingDay"]}
        );

        if(monthDay === null){
            throw new BadRequestException("Month Day ID not found");
        }

        if(!monthDay.isWorkingDay){
            throw new BadRequestException("Month Day is not a working day");
        }

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