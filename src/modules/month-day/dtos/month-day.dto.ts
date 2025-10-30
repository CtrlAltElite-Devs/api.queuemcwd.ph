import { DaysOfWeek } from "src/entities/monthDay.entity";

export class MonthDayDto {
    id: string;
    month: number;
    day: number;
    dayofWeek : DaysOfWeek;
    isWorkingDay: boolean;
}