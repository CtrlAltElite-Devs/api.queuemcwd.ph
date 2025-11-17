import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateMonthDayDto {
    @IsOptional()
    @IsBoolean()
    isWorkingDay?: boolean;

    @IsOptional()
    @IsString()
    additionalNotes?: string;
}
