import { DaysOfWeek, MonthDay } from "src/entities/monthDay.entity";

export class MonthDayDto {
    id: string;
    month: number;
    day: number;
    dayofWeek: DaysOfWeek;
    isWorkingDay: boolean;

    static Map(monthDay: MonthDay): MonthDayDto {
        const dto = new MonthDayDto();
        dto.id = monthDay.id;
        dto.month = monthDay.month;
        dto.day = monthDay.day;
        dto.dayofWeek = monthDay.dayofWeek;
        dto.isWorkingDay = monthDay.isWorkingDay;
        return dto;
    }
}
