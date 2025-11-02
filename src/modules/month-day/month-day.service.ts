import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { UnitOfWork } from "../common/unit-of-work";
import { MonthDayDto } from "./dtos/month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly monthDayRepository: MonthDayRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetMonthDayById(monthDayId: string) {
        const monthDay = await this.monthDayRepository.findOne({
            id: monthDayId,
        });

        if (monthDay === null) throw new NotFoundException("monthday not found");

        return MonthDayDto.Map(monthDay);
    }

    async UpdateMonthDay(monthDayId: string, dto: UpdateMonthDayDto) {
        const monthDay = await this.monthDayRepository.findOne({ id: monthDayId });
        if (monthDay === null) {
            throw new BadRequestException("Month Day not found");
        }

        monthDay.Update(dto);
        await this.unitOfWork.Commit();
        return MonthDayDto.Map(monthDay);
    }
}
