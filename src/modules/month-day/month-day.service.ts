import { BadRequestException, Injectable } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";
import { MonthDayDto } from "./dtos/month-day.dto";
import { SeedMonthDayDto } from "./dtos/seed-month-day.dto";
import { getMonthMetadata } from "src/cron-jobs/utilities/get-current-month-data.util";
import { createMonthDays } from "src/cron-jobs/utilities/generate-month-days.util";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly repository: MonthDayRepository
    ){}

    async GetMonthDaysAsync(params: MonthDayResourceParameter) : Promise<MonthDayDto[]>{
        const result =  await this.repository.GetMonthDayAsync(params);

        return result.map(item => {
            const dto = new MonthDayDto();
            dto.id = item.id;
            dto.month = item.month;
            dto.day = item.day;
            dto.dayofWeek = item.dayofWeek;
            dto.isWorkingDay = item.isWorkingDay;
            return dto;
        });
    }

    async SeedMonthDayAsync(dto: SeedMonthDayDto) {
        if (dto.month < 1 || dto.month > 12) {
            throw new BadRequestException("Invalid month: must be between 1 and 12");
        }
        if (dto.year < 1970 || dto.year > 2100) {
            throw new BadRequestException("Invalid year: must be between 1970 and 2100");
        }

        const monthMetaData = getMonthMetadata(dto.month, dto.year);
        const exists = await this.repository.findOne({month: monthMetaData.month, year: monthMetaData.year});
        if(exists !== null){
            throw new BadRequestException("Month days for the specified month and year already seeded");
        }
        const monthDays = createMonthDays(monthMetaData);
        
        try {
            await this.repository.getEntityManager().persistAndFlush(monthDays);
        } catch {
            throw new BadRequestException(`Failed to seed month days`);
        }
        return {
            seededMonthDays: monthDays.length,
            seededSlots: monthDays.reduce((acc, md) => acc + md.slots.getItems().length, 0)
        }
    }
}