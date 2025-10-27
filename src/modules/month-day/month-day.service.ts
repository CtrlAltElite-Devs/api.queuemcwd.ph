import { Injectable } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { MonthDayResourceParameter } from "./resource-parameters/month-day-resource-parameters";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly repository: MonthDayRepository
    ){}

    async getMonthDaySlots(params: MonthDayResourceParameter){
        return await this.repository.GetMonthDayWithSlots(params);
    }
}