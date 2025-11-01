import { IsBoolean, IsOptional } from "class-validator";

export class UpdateMonthDayDto {
    @IsOptional()
    @IsBoolean()
    isWorkingDay?: boolean;
}
