import { Injectable } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly repository: MonthDayRepository
    ){}

    async GetMonthDaysAsync(params: MonthDayResourceParameter){
        return await this.repository.GetMonthDayAsync(params);
    }
}