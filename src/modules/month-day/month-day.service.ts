import { Injectable } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";
import { MonthDayDto } from "./dtos/month-day.dto";

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
}